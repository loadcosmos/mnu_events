# MNU Events - Deployment Guide

Complete guide for deploying MNU Events platform to production.

## 📋 Overview

This guide covers deployment of:
- **Backend API** - NestJS on Railway/Render
- **Database** - PostgreSQL on Railway
- **Frontend** - React on Vercel (when ready)

## 🚀 Backend Deployment (Railway)

Railway is recommended for its simplicity and PostgreSQL support.

### Prerequisites
- Railway account (https://railway.app)
- GitHub repository
- Domain name (optional)

### Step 1: Create Railway Project

1. Go to https://railway.app
2. Click "New Project"
3. Select "Provision PostgreSQL"
4. Note the DATABASE_URL

### Step 2: Deploy Backend

1. In Railway dashboard, click "New"
2. Select "GitHub Repo"
3. Choose your repository
4. Set root directory to `backend`
5. Railway will auto-detect NestJS

### Step 3: Configure Environment Variables

Add these variables in Railway dashboard:

```env
# Database (auto-provided by Railway)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT Secrets (generate strong random strings)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRATION=1h
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-min-32-chars
REFRESH_TOKEN_EXPIRATION=7d

# Email Verification
EMAIL_VERIFICATION_SECRET=your-email-verification-secret-min-32-chars
EMAIL_VERIFICATION_EXPIRATION=24h

# SMTP Configuration (example with Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@mnuevents.kz

# Application
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-frontend-domain.vercel.app

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

### Step 4: Generate Secrets

Use these commands to generate strong secrets:

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Step 5: Deploy

Railway will automatically:
1. Install dependencies
2. Generate Prisma client
3. Run migrations
4. Build the application
5. Start the server

### Step 6: Verify Deployment

Check logs in Railway dashboard:
- Look for "MNU Events API Server" message
- Visit https://your-app.railway.app/api/docs

## 🗄️ Database Management

### Run Migrations

Railway runs migrations automatically on deploy. To run manually:

```bash
# Using Railway CLI
railway run npx prisma migrate deploy

# Or in Railway dashboard > Settings > Deploy Command
npx prisma migrate deploy && npm run start:prod
```

### Seed Production Database (Optional)

**WARNING**: Only for initial setup, not for production data!

```bash
railway run npm run prisma:seed
```

For production, create an admin user manually:

```sql
-- Connect to Railway PostgreSQL
-- Insert admin user (password: Admin123!)
INSERT INTO users (id, email, password, "firstName", "lastName", role, "emailVerified", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@kazguu.kz',
  '$2b$10$YourHashedPasswordHere',
  'Admin',
  'User',
  'ADMIN',
  true,
  NOW(),
  NOW()
);
```

To generate password hash:

```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('YourPassword123!', 10).then(console.log)"
```

### Backup Database

```bash
# Using Railway CLI
railway run pg_dump $DATABASE_URL > backup.sql

# Restore
railway run psql $DATABASE_URL < backup.sql
```

## 🌐 Alternative Deployment: Render

### Step 1: Create Render Account

1. Go to https://render.com
2. Connect GitHub account

### Step 2: Create PostgreSQL Database

1. Click "New +"
2. Select "PostgreSQL"
3. Choose free plan
4. Note the Internal Database URL

### Step 3: Create Web Service

1. Click "New +"
2. Select "Web Service"
3. Connect repository
4. Configure:
   - **Name**: mnu-events-api
   - **Region**: Frankfurt (closest to Kazakhstan)
   - **Branch**: main
   - **Root Directory**: backend
   - **Runtime**: Node
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Plan**: Free

### Step 4: Add Environment Variables

Same as Railway (see Step 3 above)

## 📧 Email Configuration (Gmail)

### Option 1: Gmail App Password

1. Enable 2-factor authentication on Gmail
2. Go to https://myaccount.google.com/apppasswords
3. Create new app password
4. Use in `SMTP_PASSWORD`

### Option 2: SendGrid (Recommended for production)

1. Create SendGrid account (https://sendgrid.com)
2. Generate API key
3. Update environment:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=noreply@mnuevents.kz
```

## 🔒 Security Checklist

Before going live:

- [ ] Change all default passwords
- [ ] Use strong JWT secrets (32+ characters)
- [ ] Enable HTTPS only
- [ ] Set correct CORS_ORIGIN
- [ ] Enable rate limiting
- [ ] Review database indexes
- [ ] Set up error monitoring (Sentry)
- [ ] Configure backup strategy
- [ ] Test email delivery
- [ ] Review API permissions

## 📊 Monitoring

### Railway

Built-in monitoring:
- Metrics tab shows CPU, memory, network
- Logs tab for application logs

### External Tools

Recommended:
- **Sentry** - Error tracking
- **Uptime Robot** - Uptime monitoring
- **LogRocket** - User session replay

## 🔄 CI/CD

### Automatic Deployment

Railway/Render automatically deploy when you push to main branch.

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: cd backend && npm ci

      - name: Run tests
        run: cd backend && npm run test

      - name: Build
        run: cd backend && npm run build

      # Railway/Render will handle actual deployment
```

## 🌍 Custom Domain

### Railway

1. Go to Settings > Networking
2. Click "Generate Domain" or "Custom Domain"
3. Add CNAME record in your DNS:
   ```
   api.mnuevents.kz -> your-app.railway.app
   ```

### Render

1. Go to Settings > Custom Domain
2. Add domain: api.mnuevents.kz
3. Update DNS CNAME record

### SSL Certificate

Both Railway and Render provide free SSL certificates automatically.

## 📝 Environment-Specific Configuration

### Development
```env
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/mnu_events_dev
CORS_ORIGIN=http://localhost:5173
```

### Staging
```env
NODE_ENV=staging
DATABASE_URL=${{STAGING_DATABASE_URL}}
CORS_ORIGIN=https://staging.mnuevents.kz
```

### Production
```env
NODE_ENV=production
DATABASE_URL=${{PRODUCTION_DATABASE_URL}}
CORS_ORIGIN=https://mnuevents.kz
```

## 🐛 Troubleshooting

### Migration Errors

```bash
# Reset migrations (DANGER: loses all data)
railway run npx prisma migrate reset

# Create new migration
railway run npx prisma migrate dev --name init
```

### Out of Memory

Increase memory in Railway/Render settings:
- Railway: Automatically scales
- Render: Upgrade plan

### Database Connection Issues

Check:
1. DATABASE_URL format is correct
2. SSL mode is enabled (Railway requires it)
3. Connection pooling is configured

### Email Not Sending

1. Check SMTP credentials
2. Verify firewall allows port 587
3. Check spam folder
4. Review application logs

## 📞 Support

For deployment issues:
- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
- Prisma Docs: https://www.prisma.io/docs

## 🎓 University Handover

When handing over to MNU:

1. **Documentation**
   - Provide all README files
   - Document all environment variables
   - Share database schema
   - Include API documentation link

2. **Access**
   - Transfer Railway/Render account ownership
   - Provide admin credentials (securely)
   - Share email account details

3. **Training**
   - How to view logs
   - How to add new organizers
   - How to backup database
   - How to update environment variables

4. **Maintenance**
   - Schedule weekly backups
   - Monitor error rates
   - Review user feedback
   - Plan feature updates

## ✅ Post-Deployment Checklist

- [ ] API is accessible via public URL
- [ ] Swagger docs are working
- [ ] Database migrations completed
- [ ] Admin user created
- [ ] Email verification working
- [ ] All endpoints tested
- [ ] CORS configured correctly
- [ ] SSL certificate active
- [ ] Monitoring set up
- [ ] Backup strategy in place
- [ ] Documentation shared with team
- [ ] Credentials stored securely

---

**Congratulations! Your MNU Events platform is now live! 🎉**
