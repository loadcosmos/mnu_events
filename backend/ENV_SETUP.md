# Настройка .env файла для Backend

## Быстрый старт

1. Скопируйте пример:
```bash
cp .env.example .env
```

2. Отредактируйте `.env` файл и заполните значения ниже

---

## 📋 Откуда брать значения

### 1. DATABASE_URL (обязательно)

**Если используете Docker Compose** (рекомендуется):
```env
DATABASE_URL=postgresql://mnu_user:mnu_password@localhost:5432/mnu_events_dev
```

Значения из `docker-compose.yml`:
- User: `mnu_user`
- Password: `mnu_password`
- Host: `localhost`
- Port: `5432`
- Database: `mnu_events_dev`

**Если используете локальный PostgreSQL:**
```env
DATABASE_URL=postgresql://postgres:ваш_пароль@localhost:5432/mnu_events_dev
```

---

### 2. JWT_SECRET (обязательно)

Секретный ключ для JWT токенов. **Сгенерируйте случайную строку минимум 32 символа!**

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Linux/Mac:**
```bash
openssl rand -base64 32
```

**Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Онлайн:** https://randomkeygen.com/

Пример:
```env
JWT_SECRET=AbCdEf1234567890XyZwVuTsRqPoNmLkJiHgFeDcBa9876543210
```

---

### 3. REFRESH_TOKEN_SECRET (обязательно)

То же самое, что JWT_SECRET, но **другой ключ**! Сгенерируйте новый.

```env
REFRESH_TOKEN_SECRET=ZxYwVu9876543210TsRqPoNmLkJiHgFeDcBaAbCdEf1234567890
```

---

### 4. EMAIL_VERIFICATION_SECRET (обязательно)

То же самое, но **еще один другой ключ**! Сгенерируйте новый.

```env
EMAIL_VERIFICATION_SECRET=9876543210AbCdEfXyZwVuTsRqPoNmLkJiHgFeDcBa1234567890
```

---

### 5. SMTP настройки (для email)

#### Вариант A: Gmail (для разработки)

1. Включите 2FA в Google аккаунте
2. Создайте App Password: https://myaccount.google.com/apppasswords
3. Используйте этот пароль:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ваш-email@gmail.com
SMTP_PASSWORD=ваш-app-password-из-google
EMAIL_FROM=noreply@mnuevents.kz
```

#### Вариант B: Другой SMTP провайдер

```env
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-password
EMAIL_FROM=noreply@your-domain.com
```

#### Вариант C: Пропустить (email не будет работать)

Для разработки можно оставить пустым, но email verification не будет работать:

```env
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=noreply@mnuevents.kz
```

---

### 6. Остальные настройки (можно оставить по умолчанию)

```env
# Порт API
PORT=3001

# Режим работы
NODE_ENV=development

# Время жизни токенов
JWT_EXPIRATION=1h
REFRESH_TOKEN_EXPIRATION=7d
EMAIL_VERIFICATION_EXPIRATION=24h

# CORS (URL frontend)
CORS_ORIGIN=http://localhost:5173

# Rate limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

---

## ✅ Минимальная конфигурация для запуска

Минимально необходимые переменные:

```env
DATABASE_URL=postgresql://mnu_user:mnu_password@localhost:5432/mnu_events_dev
JWT_SECRET=сгенерируйте-случайную-строку-32-символа
REFRESH_TOKEN_SECRET=другая-случайная-строка-32-символа
EMAIL_VERIFICATION_SECRET=еще-одна-случайная-строка-32-символа
```

Остальные можно оставить пустыми или использовать значения по умолчанию.

---

## 🔒 Безопасность

⚠️ **НИКОГДА не коммитьте `.env` файл в Git!**

Он уже в `.gitignore`, но проверьте:
- `.env` должен быть в `.gitignore`
- Используйте разные секреты для development и production
- В production используйте очень сильные случайные ключи

---

## 📝 Пример полного .env файла

```env
# Database
DATABASE_URL=postgresql://mnu_user:mnu_password@localhost:5432/mnu_events_dev

# Application
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=AbCdEf1234567890XyZwVuTsRqPoNmLkJiHgFeDcBa9876543210
JWT_EXPIRATION=1h

# Refresh Token
REFRESH_TOKEN_SECRET=ZxYwVu9876543210TsRqPoNmLkJiHgFeDcBaAbCdEf1234567890
REFRESH_TOKEN_EXPIRATION=7d

# Email Verification
EMAIL_VERIFICATION_SECRET=9876543210AbCdEfXyZwVuTsRqPoNmLkJiHgFeDcBa1234567890
EMAIL_VERIFICATION_EXPIRATION=24h

# SMTP (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@mnuevents.kz

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

---

## 🆘 Проблемы?

### База данных не подключается
- Убедитесь, что Docker Compose запущен: `docker-compose up -d`
- Проверьте, что порт 5432 свободен
- Проверьте правильность DATABASE_URL

### Email не отправляется
- Проверьте SMTP настройки
- Для Gmail убедитесь, что создали App Password
- Проверьте, что 2FA включен в Google аккаунте

### JWT ошибки
- Убедитесь, что JWT_SECRET установлен и достаточно длинный (32+ символа)
- Проверьте, что все три секрета (JWT, REFRESH, EMAIL_VERIFICATION) разные

