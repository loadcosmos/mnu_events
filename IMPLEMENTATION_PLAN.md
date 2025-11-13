# 🚀 MNU Events Platform - Implementation Plan

## 📋 Обзор Проекта

Расширение платформы MNU Events новыми функциями монетизации, QR check-in, marketplace услуг и аналитики.

**Подход:** Frontend-first с моковыми данными → постепенная интеграция backend
**Дизайн:** Сохранение единого liquid glass стиля
**Технологии:** NestJS + Prisma + React 19 + Vite

---

## ✅ ФАЗА 1: Database Schema & Migrations (ЗАВЕРШЕНО)

**Статус:** ✅ Completed
**Время:** 1-2 дня
**Дата завершения:** 2025-11-13

### Выполненные задачи

#### 1.1 Prisma Schema Updates ✅

**Новые модели:**
- **Ticket** - Платные билеты с QR кодами
  - Поля: `id`, `eventId`, `userId`, `price`, `platformFee`, `status`, `paymentMethod`, `transactionId`, `qrCode`
  - Enums: `TicketStatus` (PENDING, PAID, REFUNDED, USED, EXPIRED)

- **CheckIn** - Посещаемость событий
  - Поля: `id`, `eventId`, `userId`, `scanMode`, `checkedInAt`
  - Enum: `CheckInMode` (ORGANIZER_SCANS, STUDENTS_SCAN)

- **Service** - Marketplace услуг
  - Поля: `id`, `providerId`, `type`, `title`, `description`, `category`, `price`, `priceType`, `rating`, `reviewCount`
  - Enums: `ServiceType` (GENERAL, TUTORING), `ServiceCategory`, `PriceType`

- **Advertisement** - Рекламные баннеры
  - Поля: `id`, `title`, `imageUrl`, `linkUrl`, `position`, `isActive`, `impressions`, `clicks`
  - Enum: `AdPosition` (TOP_BANNER, HERO_SLIDE, NATIVE_FEED, BOTTOM_BANNER, SIDEBAR)

**Обновленные модели:**
- **Event** - добавлены поля для платных событий и QR check-in
  - `isPaid`, `price`, `platformFee`, `checkInMode`, `eventQRCode`, `qrCodeExpiry`
- **User** - добавлены relations
  - `tickets`, `checkIns`, `services`

#### 1.2 Миграции ✅

```bash
✅ 20251113071452_add_monetization_features
✅ 20251113071819_add_service_review_count
```

#### 1.3 Seed Data ✅

**Создано:**
- 5 пользователей (Admin, Organizer, 3 Students)
- 13 событий (10 free + 2 paid + 1 lecture)
- 7 бесплатных регистраций
- 3 платных билета с QR кодами
- 2 check-ins (students_scan mode)
- 6 услуг (3 general + 3 tutoring)
- 4 рекламных объявления
- 6 клубов и 7 членств

**Тестовые аккаунты:**
```
admin@kazguu.kz       - Password123!
organizer@kazguu.kz   - Password123!
student1@kazguu.kz    - Password123!
student2@kazguu.kz    - Password123!
student3@kazguu.kz    - Password123!
```

---

## 🔧 ФАЗА 2: Backend Modules (В ПРОЦЕССЕ)

**Статус:** 🟡 In Progress
**Время:** 2-3 дня
**Приоритет:** 🔴 Критично

### 2.1 PaymentModule - Mock Payment Provider

**Файлы для создания:**
```
backend/src/payments/
├── payments.module.ts
├── payments.controller.ts
├── payments.service.ts
├── dto/
│   ├── create-payment.dto.ts
│   ├── payment-webhook.dto.ts
│   └── refund-ticket.dto.ts
└── interfaces/
    └── payment-response.interface.ts
```

**Endpoints:**
```typescript
POST   /api/payments/create          // Создать платеж (mock)
POST   /api/payments/webhook          // Webhook подтверждения (mock)
GET    /api/payments/ticket/:id       // Получить билет по ID
GET    /api/payments/my-tickets       // Мои билеты
POST   /api/payments/refund/:id       // Возврат билета
GET    /api/payments/transaction/:id  // Статус транзакции
```

**Environment Variables:**
```env
PAYMENT_MODE=mock  # или 'production' для Kaspi
PAYMENT_SECRET=your-secret-key-for-qr-signatures
```

**Функционал:**
1. Mock транзакции с уникальным ID
2. Редирект на `/mock-payment/:transactionId`
3. Webhook симуляция (успех/ошибка/отклонено)
4. Генерация QR кода для билета (используя `qrcode` library)
5. Email с билетом (если SMTP настроен)

**Зависимости:**
```bash
npm install qrcode
npm install @types/qrcode --save-dev
```

### 2.2 CheckInModule - QR Validation

**Файлы для создания:**
```
backend/src/checkin/
├── checkin.module.ts
├── checkin.controller.ts
├── checkin.service.ts
└── dto/
    ├── validate-ticket.dto.ts
    ├── validate-student.dto.ts
    └── checkin-stats.dto.ts
```

**Endpoints:**
```typescript
POST /api/checkin/validate-ticket    // Валидация билета (режим 1: organizer scans)
POST /api/checkin/validate-student    // Валидация студента (режим 2: students scan)
GET  /api/checkin/event/:id/stats     // Статистика check-in по событию
POST /api/checkin/generate-event-qr   // Генерация QR для события
GET  /api/checkin/event/:id/list      // Список всех check-ins
```

**Логика валидации:**

**Режим 1 (ORGANIZER_SCANS):**
```typescript
// Организатор сканирует QR билета студента
1. Проверка подписи QR кода (crypto.createHmac)
2. Проверка существования билета в БД
3. Проверка статуса билета (должен быть PAID)
4. Проверка eventId (билет для правильного события)
5. Проверка уникальности (билет не использован)
6. Обновление статуса билета → USED
7. Создание записи CheckIn
8. Возврат информации о пользователе
```

**Режим 2 (STUDENTS_SCAN):**
```typescript
// Студент сканирует QR события
1. Проверка eventQRCode события
2. Проверка срока действия QR (qrCodeExpiry)
3. Проверка уникальности (студент еще не регистрировался)
4. Rate limiting (макс 1 скан в 5 секунд)
5. Опционально: Geolocation check (в радиусе 500м)
6. Создание записи CheckIn
7. Обновление статистики события
```

### 2.3 ServicesModule - Marketplace

**Файлы для создания:**
```
backend/src/services/
├── services.module.ts
├── services.controller.ts
├── services.service.ts
└── dto/
    ├── create-service.dto.ts
    ├── update-service.dto.ts
    └── filter-services.dto.ts
```

**Endpoints:**
```typescript
GET    /api/services              // Список услуг (с фильтрами)
GET    /api/services/:id          // Детали услуги
POST   /api/services              // Создать услугу
PUT    /api/services/:id          // Обновить услугу
DELETE /api/services/:id          // Удалить услугу
GET    /api/services/my-services  // Мои услуги
GET    /api/services/provider/:id // Услуги провайдера
```

**Фильтры:**
```typescript
interface FilterServicesDto {
  type?: ServiceType;        // GENERAL или TUTORING
  category?: ServiceCategory;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  isActive?: boolean;
  search?: string;           // Поиск по title/description
  page?: number;
  limit?: number;
}
```

**Авторизация:**
- Создание/обновление/удаление: только владелец или ADMIN
- Просмотр: публичный доступ

### 2.4 AnalyticsModule - Статистика

**Файлы для создания:**
```
backend/src/analytics/
├── analytics.module.ts
├── analytics.controller.ts
├── analytics.service.ts
└── dto/
    ├── dashboard-stats.dto.ts
    ├── organizer-stats.dto.ts
    ├── student-stats.dto.ts
    └── revenue-stats.dto.ts
```

**Endpoints:**
```typescript
GET /api/analytics/dashboard         // Общая статистика (ADMIN only)
GET /api/analytics/organizer/:userId // Статистика организатора
GET /api/analytics/student/:userId   // Статистика студента
GET /api/analytics/revenue           // Финансовая статистика (ADMIN only)
GET /api/analytics/event/:id         // Детальная статистика события
```

**Метрики:**

**Dashboard (Admin):**
```typescript
{
  totalEvents: number;
  totalUsers: number;
  totalRevenue: number;
  totalTicketsSold: number;
  eventsByCategory: { category: string; count: number }[];
  revenueByMonth: { month: string; amount: number }[];
  topEvents: Event[];
}
```

**Organizer Stats:**
```typescript
{
  totalEvents: number;
  upcomingEvents: number;
  totalRegistrations: number;
  totalCheckIns: number;
  checkInRate: number;
  revenueGenerated: number;
  eventPerformance: {
    eventId: string;
    title: string;
    registrations: number;
    checkIns: number;
    revenue: number;
  }[];
}
```

**Student Stats:**
```typescript
{
  eventsAttended: number;
  upcomingEvents: number;
  clubMemberships: number;
  ticketsPurchased: number;
  badges: {
    name: string;
    unlocked: boolean;
    requirement: string;
  }[];
}
```

---

## 🎨 ФАЗА 3: Frontend - HomePage Redesign

**Статус:** ⏳ Pending
**Время:** 2-3 дня
**Приоритет:** 🟡 Высокий

### 3.1 Новые Компоненты

#### TabNavigation.jsx
```jsx
frontend/js/components/TabNavigation.jsx
```

**Структура:**
```javascript
const tabs = [
  { id: 'events', label: 'События', icon: Calendar },
  { id: 'clubs', label: 'Клубы', icon: Users },
  { id: 'services', label: 'Услуги', icon: Briefcase },
  { id: 'tutoring', label: 'Репетиторство', icon: GraduationCap },
  { id: 'more', label: 'Еще', icon: MoreHorizontal, dropdown: true }
];
```

**Функционал:**
- Активный таб с подсветкой
- Переключение контента без перезагрузки страницы
- Мобильная адаптация (горизонтальный скролл)
- Dropdown для "Еще" (будущие разделы)

#### AdBanner.jsx
```jsx
frontend/js/components/AdBanner.jsx
```

**Props:**
```typescript
interface AdBannerProps {
  position: 'TOP_BANNER' | 'HERO_SLIDE' | 'NATIVE_FEED' | 'BOTTOM_BANNER';
  size?: { desktop: string; mobile: string };
  onImpression?: () => void;
  onClick?: () => void;
}
```

**Размеры:**
- TOP_BANNER: 728x90px (desktop), 320x50px (mobile)
- HERO_SLIDE: Full-width carousel slide
- NATIVE_FEED: Карточка среди контента
- BOTTOM_BANNER: 728x90px (desktop), 320x50px (mobile, sticky)

#### HeroCarousel.jsx
```jsx
frontend/js/components/HeroCarousel.jsx
```

**Функционал:**
- Автоматическая ротация (5 секунд)
- Индикаторы слайдов
- Стрелки навигации
- Поддержка рекламных слайдов (каждый 3-й слайд)
- Пауза на hover
- Swipe support для мобильных

#### ServiceCard.jsx
```jsx
frontend/js/components/ServiceCard.jsx
```

**Отображение:**
- Изображение услуги
- Заголовок и краткое описание
- Цена и тип оплаты (hourly/fixed/per_session)
- Рейтинг (звезды) и количество отзывов
- Категория badge
- Кнопка "Заказать"

#### NativeAd.jsx
```jsx
frontend/js/components/NativeAd.jsx
```

**Логика:**
- Вставляется каждая 5-6 карточка в ленте
- Стиль похож на обычный контент
- Метка "Реклама" (прозрачность)
- Отслеживание impressions и clicks

### 3.2 Обновление HomePage.jsx

**Новая структура:**
```
┌─────────────────────────────────────────┐
│ Header (Navigation)                     │
├─────────────────────────────────────────┤
│ 🎯 AdBanner (TOP_BANNER)                │
├─────────────────────────────────────────┤
│ HeroCarousel (с рекламными слайдами)    │
├─────────────────────────────────────────┤
│ TabNavigation (События|Клубы|Услуги|+)  │
├─────────────────────────────────────────┤
│ TabContent (зависит от активного таба)  │
│ - События: лента + нативная реклама     │
│ - Клубы: лента клубов + реклама         │
│ - Услуги: карточки специалистов         │
│ - Репетиторство: карточки репетиторов   │
├─────────────────────────────────────────┤
│ 🎯 AdBanner (BOTTOM_BANNER)             │
│ Footer                                  │
└─────────────────────────────────────────┘
```

**Mock данные (до интеграции backend):**
```javascript
const mockAds = [
  { id: 1, position: 'TOP_BANNER', imageUrl: '/ads/banner-1.png', linkUrl: 'https://kaspi.kz' },
  { id: 2, position: 'HERO_SLIDE', imageUrl: '/ads/hero-ad.png' },
  { id: 3, position: 'NATIVE_FEED', imageUrl: '/ads/native-1.png' }
];

const mockServices = [
  { id: 1, type: 'GENERAL', title: 'Logo Design', price: 15000, rating: 4.8 },
  { id: 2, type: 'TUTORING', title: 'Math Tutoring', price: 5000, rating: 5.0 }
];
```

### 3.3 Новые Страницы

#### ServicesPage.jsx
```
Route: /services
```
- Список всех услуг (GENERAL type)
- Фильтры по категориям
- Поиск по названию
- Сортировка (цена, рейтинг)

#### TutoringPage.jsx
```
Route: /tutoring
```
- Специализированная страница для TUTORING type
- Фильтры по предметам
- Рейтинг репетиторов
- Цена за час

#### ServiceDetailsPage.jsx
```
Route: /services/:id
```
- Детальная информация об услуге
- Профиль провайдера
- Отзывы (будущая фича)
- Кнопка "Заказать" (контакт/оплата)

---

## 💳 ФАЗА 4: Платные События & Mock Payment

**Статус:** ⏳ Pending
**Время:** 2 дня
**Приоритет:** 🟡 Высокий

### 4.1 Обновление EventDetailsPage.jsx

**Добавить секцию оплаты:**
```jsx
{event.isPaid && (
  <div className="payment-section">
    <div className="price-display">
      <h2>{event.price}₸</h2>
      <span className="badge">Платное событие</span>
    </div>

    <div className="price-breakdown">
      <div className="breakdown-item">
        <span>На благотворительность</span>
        <span>{event.price - event.platformFee}₸</span>
      </div>
      <div className="breakdown-item">
        <span>Комиссия платформы</span>
        <span>{event.platformFee}₸</span>
      </div>
    </div>

    <div className="capacity-info">
      <Users className="icon" />
      <span>Мест осталось: {event.capacity - registeredCount} / {event.capacity}</span>
    </div>

    <Button onClick={handleBuyTicket} size="lg" disabled={isSoldOut}>
      {isSoldOut ? 'Билеты проданы' : 'Купить билет'}
    </Button>
  </div>
)}
```

### 4.2 MockPaymentPage.jsx

**Route:** `/mock-payment/:transactionId`

**UI:**
```jsx
<div className="mock-payment-page">
  <div className="header">
    <h1>Mock Payment Gateway</h1>
    <span className="badge">Тестовый режим</span>
  </div>

  <div className="transaction-info">
    <h2>Детали платежа</h2>
    <div className="info-row">
      <span>Transaction ID:</span>
      <code>{transactionId}</code>
    </div>
    <div className="info-row">
      <span>Сумма:</span>
      <strong>{amount}₸</strong>
    </div>
    <div className="info-row">
      <span>Событие:</span>
      <span>{eventTitle}</span>
    </div>
    <div className="info-row">
      <span>Дата:</span>
      <span>{formatDate(eventDate)}</span>
    </div>
  </div>

  <div className="action-buttons">
    <Button
      onClick={handleSuccess}
      variant="success"
      className="action-btn"
    >
      ✅ Успешная оплата
    </Button>

    <Button
      onClick={handleDecline}
      variant="danger"
      className="action-btn"
    >
      ❌ Отклонить платеж
    </Button>

    <Button
      onClick={handleError}
      variant="warning"
      className="action-btn"
    >
      ⚠️ Ошибка сети
    </Button>
  </div>

  <div className="note">
    <Info className="icon" />
    <p>Это тестовый шлюз оплаты. В production будет интеграция с Kaspi.kz</p>
  </div>
</div>
```

### 4.3 TicketView.jsx

**Отображение купленного билета:**
```jsx
<div className="ticket-view">
  <div className="ticket-header">
    <h2>{event.title}</h2>
    <span className="ticket-status">{ticket.status}</span>
  </div>

  <div className="qr-section">
    <img src={ticket.qrCode} alt="QR Code" className="qr-code" />
    <p className="qr-instructions">
      Покажите этот QR код на входе
    </p>
  </div>

  <div className="ticket-details">
    <div className="detail-row">
      <Calendar className="icon" />
      <span>{formatDate(event.startDate)}</span>
    </div>
    <div className="detail-row">
      <MapPin className="icon" />
      <span>{event.location}</span>
    </div>
    <div className="detail-row">
      <Clock className="icon" />
      <span>{formatTime(event.startDate)}</span>
    </div>
    <div className="detail-row">
      <Hash className="icon" />
      <span>Билет #{ticket.id.slice(0, 8)}</span>
    </div>
  </div>

  <div className="ticket-actions">
    <Button onClick={downloadTicket} variant="outline">
      <Download className="icon" />
      Скачать билет
    </Button>
    <Button onClick={shareTicket} variant="outline">
      <Share className="icon" />
      Поделиться
    </Button>
  </div>
</div>
```

### 4.4 Обновление MyRegistrationsPage.jsx

**Добавить вкладку "Мои билеты":**
```jsx
<div className="my-registrations-page">
  <Tabs defaultValue="registrations">
    <TabsList>
      <TabsTrigger value="registrations">
        Регистрации
        <Badge>{freeRegistrations.length}</Badge>
      </TabsTrigger>
      <TabsTrigger value="tickets">
        Мои билеты
        <Badge>{paidTickets.length}</Badge>
      </TabsTrigger>
    </TabsList>

    <TabsContent value="registrations">
      {/* Существующий код регистраций */}
    </TabsContent>

    <TabsContent value="tickets">
      <div className="tickets-grid">
        {paidTickets.map(ticket => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>
    </TabsContent>
  </Tabs>
</div>
```

---

## 📱 ФАЗА 5: QR Check-in System

**Статус:** ⏳ Pending
**Время:** 3 дня
**Приоритет:** 🟡 Высокий

### 5.1 Install Dependencies

```bash
cd frontend
npm install html5-qrcode
```

**Backend dependencies (уже установлены в Фазе 2):**
```bash
cd backend
npm install qrcode
npm install @types/qrcode --save-dev
```

### 5.2 OrganizerScannerPage.jsx

**Route:** `/organizer/scanner/:eventId`

**Функционал - Режим 1 (Организатор сканирует студентов):**

```jsx
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function OrganizerScannerPage() {
  const { eventId } = useParams();
  const [scanning, setScanning] = useState(false);
  const [stats, setStats] = useState({ checkedIn: 0, total: 0 });
  const [lastScan, setLastScan] = useState(null);

  useEffect(() => {
    loadStats();
  }, [eventId]);

  const handleScan = async (qrData) => {
    try {
      const data = JSON.parse(qrData);

      // Валидация на backend
      const response = await checkinService.validateTicket(data);

      if (response.success) {
        // ✅ Успешный check-in
        playSound('success.mp3');
        showToast('✅ Check-in успешен!', 'success');
        setLastScan({
          success: true,
          user: response.user,
          timestamp: new Date()
        });
        updateStats();
      }
    } catch (error) {
      // ❌ Ошибка
      playSound('error.mp3');
      showToast('❌ ' + error.message, 'error');
      setLastScan({
        success: false,
        error: error.message,
        timestamp: new Date()
      });
    }
  };

  const startScanning = () => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(handleScan, (error) => {
      console.warn('QR scan error:', error);
    });

    setScanning(true);
  };

  return (
    <div className="scanner-page">
      <div className="header">
        <h1>QR Scanner</h1>
        <Button onClick={() => navigate(-1)} variant="ghost">
          <ArrowLeft /> Назад
        </Button>
      </div>

      <div className="stats-card">
        <div className="stat">
          <CheckCircle className="icon success" />
          <div>
            <h3>{stats.checkedIn}</h3>
            <span>Зарегистрировано</span>
          </div>
        </div>
        <div className="stat">
          <Users className="icon" />
          <div>
            <h3>{stats.total}</h3>
            <span>Всего билетов</span>
          </div>
        </div>
        <div className="stat">
          <TrendingUp className="icon" />
          <div>
            <h3>{((stats.checkedIn / stats.total) * 100).toFixed(0)}%</h3>
            <span>Check-in rate</span>
          </div>
        </div>
      </div>

      {!scanning ? (
        <div className="start-section">
          <Button onClick={startScanning} size="lg" className="start-btn">
            <Camera className="icon" />
            Начать сканирование
          </Button>
        </div>
      ) : (
        <>
          <div id="qr-reader" className="qr-reader" />

          {lastScan && (
            <div className={`last-scan ${lastScan.success ? 'success' : 'error'}`}>
              {lastScan.success ? (
                <>
                  <CheckCircle className="icon" />
                  <div className="scan-info">
                    <h3>{lastScan.user.firstName} {lastScan.user.lastName}</h3>
                    <span>{lastScan.user.faculty}</span>
                    <time>{formatTime(lastScan.timestamp)}</time>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="icon" />
                  <div className="scan-info">
                    <h3>Ошибка сканирования</h3>
                    <span>{lastScan.error}</span>
                    <time>{formatTime(lastScan.timestamp)}</time>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* Mock QR input для тестирования без камеры */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mock-input">
          <h3>Dev Mode - Mock QR Input</h3>
          <textarea
            placeholder="Вставьте JSON QR кода для теста"
            onChange={(e) => handleScan(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
```

### 5.3 Student Check-in (EventDetailsPage.jsx)

**Режим 2 (Студенты сканируют QR события):**

```jsx
// Добавить в EventDetailsPage.jsx

{event.checkInMode === 'STUDENTS_SCAN' && !hasCheckedIn && (
  <div className="student-checkin-section">
    <Button onClick={openQRScanner} size="lg" variant="primary">
      <Camera className="icon" />
      Отметить посещение
    </Button>
    <p className="checkin-note">
      Отсканируйте QR код на экране для регистрации посещения
    </p>
  </div>
)}

{hasCheckedIn && (
  <div className="checkin-success">
    <CheckCircle className="icon" />
    <span>Вы отметили посещение</span>
  </div>
)}

{showScanner && (
  <QRScannerModal
    onScan={handleStudentCheckIn}
    onClose={() => setShowScanner(false)}
  />
)}
```

### 5.4 QRScannerModal.jsx

**Переиспользуемый компонент сканера:**

```jsx
function QRScannerModal({ onScan, onClose }) {
  const [error, setError] = useState(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "modal-qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      false
    );

    scanner.render(
      async (decodedText) => {
        try {
          await onScan(decodedText);
          scanner.clear();
          onClose();
        } catch (err) {
          setError(err.message);
        }
      },
      (error) => {
        console.warn('QR scan error:', error);
      }
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, []);

  return (
    <Modal onClose={onClose} className="qr-scanner-modal">
      <div className="modal-header">
        <h2>Сканировать QR код</h2>
        <Button onClick={onClose} variant="ghost" size="sm">
          <X />
        </Button>
      </div>

      <div id="modal-qr-reader" className="modal-qr-reader" />

      {error && (
        <div className="error-message">
          <AlertCircle className="icon" />
          <span>{error}</span>
        </div>
      )}

      <div className="modal-footer">
        <p className="help-text">
          Наведите камеру на QR код события
        </p>
      </div>
    </Modal>
  );
}
```

---

## 📊 ФАЗА 6: Analytics & Dashboard

**Статус:** ⏳ Pending
**Время:** 2 дня
**Приоритет:** 🟢 Средний

### 6.1 Install Chart Library

```bash
npm install recharts
# или альтернативно
npm install chart.js react-chartjs-2
```

### 6.2 AnalyticsDashboard.jsx

**Для организаторов:**

```jsx
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

function AnalyticsDashboard({ userId }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadOrganizerStats(userId);
  }, [userId]);

  return (
    <div className="analytics-dashboard">
      <h1>Аналитика событий</h1>

      <div className="stats-grid">
        <StatCard
          title="Всего регистраций"
          value={stats.totalRegistrations}
          icon={Users}
          trend="+12% за месяц"
        />
        <StatCard
          title="Check-in rate"
          value={`${stats.checkInRate}%`}
          icon={CheckCircle}
          trend="Средний показатель"
        />
        <StatCard
          title="Доход от билетов"
          value={`${stats.revenue}₸`}
          icon={DollarSign}
          trend="+8% за месяц"
        />
        <StatCard
          title="Активных событий"
          value={stats.activeEvents}
          icon={Calendar}
        />
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <h3>Посещаемость по времени</h3>
          <BarChart width={600} height={300} data={stats.checkInsByTime}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8b5cf6" />
          </BarChart>
        </div>

        <div className="chart-card">
          <h3>Регистрации по категориям</h3>
          <PieChart width={400} height={300}>
            <Pie
              data={stats.registrationsByCategory}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8b5cf6"
              label
            />
            <Tooltip />
          </PieChart>
        </div>
      </div>

      <div className="export-section">
        <Button onClick={exportCSV} variant="outline">
          <Download className="icon" />
          Экспорт в CSV
        </Button>
        <Button onClick={exportPDF} variant="outline">
          <FileText className="icon" />
          Скачать отчет PDF
        </Button>
      </div>
    </div>
  );
}
```

### 6.3 Student Stats (ProfilePage.jsx)

```jsx
// Добавить в ProfilePage.jsx

<div className="student-stats-section">
  <h2>Мои достижения</h2>

  <div className="stats-overview">
    <div className="stat-item">
      <div className="stat-icon">🎉</div>
      <div className="stat-content">
        <h3>{stats.eventsAttended}</h3>
        <span>Посещено событий</span>
      </div>
    </div>

    <div className="stat-item">
      <div className="stat-icon">📅</div>
      <div className="stat-content">
        <h3>{stats.upcomingEvents}</h3>
        <span>Предстоящих</span>
      </div>
    </div>

    <div className="stat-item">
      <div className="stat-icon">👥</div>
      <div className="stat-content">
        <h3>{stats.clubMemberships}</h3>
        <span>Клубов</span>
      </div>
    </div>
  </div>

  <div className="badges-section">
    <h3>Значки</h3>
    <div className="badges-grid">
      <Badge
        title="⭐ Новичок"
        description="Посетить 5 событий"
        unlocked={stats.eventsAttended >= 5}
        progress={stats.eventsAttended}
        target={5}
      />
      <Badge
        title="⭐⭐ Активист"
        description="Посетить 10 событий"
        unlocked={stats.eventsAttended >= 10}
        progress={stats.eventsAttended}
        target={10}
      />
      <Badge
        title="⭐⭐⭐ Энтузиаст"
        description="Посетить 20 событий"
        unlocked={stats.eventsAttended >= 20}
        progress={stats.eventsAttended}
        target={20}
      />
      <Badge
        title="🎓 Ученик"
        description="Заказать 3 репетиторских услуги"
        unlocked={stats.tutoringOrders >= 3}
        progress={stats.tutoringOrders}
        target={3}
      />
    </div>
  </div>
</div>
```

---

## 💰 ФАЗА 7: Admin Revenue Panel

**Статус:** ⏳ Pending
**Время:** 1 день
**Приоритет:** 🟢 Средний

### 7.1 AdminRevenuePage.jsx

**Route:** `/admin/revenue`

```jsx
function AdminRevenuePage() {
  const [revenueData, setRevenueData] = useState(null);
  const [transactions, setTransactions] = useState([]);

  return (
    <div className="admin-revenue-page">
      <div className="page-header">
        <h1>Монетизация платформы</h1>
        <div className="header-actions">
          <Button onClick={exportReport} variant="outline">
            <Download /> Экспорт отчета
          </Button>
        </div>
      </div>

      <div className="revenue-stats">
        <StatCard
          title="Общий доход"
          value={`${revenueData.total}₸`}
          icon={TrendingUp}
          size="large"
        />
        <StatCard
          title="От билетов"
          value={`${revenueData.tickets}₸`}
          icon={Ticket}
          percentage={(revenueData.tickets / revenueData.total * 100).toFixed(0)}
        />
        <StatCard
          title="От рекламы"
          value={`${revenueData.ads}₸`}
          icon={Eye}
          percentage={(revenueData.ads / revenueData.total * 100).toFixed(0)}
        />
        <StatCard
          title="Комиссия платформы"
          value={`${revenueData.platformFees}₸`}
          icon={DollarSign}
          percentage={(revenueData.platformFees / revenueData.total * 100).toFixed(0)}
        />
      </div>

      <div className="revenue-charts">
        <div className="chart-card">
          <h3>Доход по месяцам</h3>
          <LineChart width={800} height={300} data={revenueData.byMonth}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="tickets" stroke="#8b5cf6" name="Билеты" />
            <Line type="monotone" dataKey="ads" stroke="#06b6d4" name="Реклама" />
          </LineChart>
        </div>
      </div>

      <div className="transactions-section">
        <h2>Все транзакции</h2>
        <Table
          columns={[
            { key: 'id', label: 'Transaction ID' },
            { key: 'date', label: 'Дата' },
            { key: 'user', label: 'Пользователь' },
            { key: 'event', label: 'Событие' },
            { key: 'amount', label: 'Сумма' },
            { key: 'status', label: 'Статус' },
          ]}
          data={transactions}
          onRowClick={handleTransactionDetails}
        />
      </div>

      <div className="ad-management-section">
        <h2>Управление рекламой</h2>
        <AdList
          ads={revenueData.advertisements}
          onEdit={handleEditAd}
          onToggle={handleToggleAd}
          onDelete={handleDeleteAd}
        />
      </div>
    </div>
  );
}
```

### 7.2 Route Setup

**Добавить в App.jsx:**
```jsx
<Route path="/admin/revenue" element={
  <ProtectedRoute roles={[ROLES.ADMIN]}>
    <AdminLayout>
      <AdminRevenuePage />
    </AdminLayout>
  </ProtectedRoute>
} />
```

---

## 🧪 ФАЗА 8: Testing & Polish

**Статус:** ⏳ Pending
**Время:** 2 дня
**Приоритет:** 🟡 Высокий

### 8.1 Обновление Seed Data

**Расширить seed данные:**
- Больше платных событий (5-10)
- Больше билетов разных статусов
- Больше услуг и репетиторов (20+)
- Больше рекламных объявлений
- История check-ins для аналитики

### 8.2 E2E Tests (Playwright)

**Новые тесты в `e2e/`:**

#### paid-events.spec.js
```javascript
test('покупка платного билета', async ({ page }) => {
  // 1. Логин как студент
  // 2. Найти платное событие
  // 3. Нажать "Купить билет"
  // 4. Редирект на mock payment
  // 5. Успешная оплата
  // 6. Проверить наличие билета в "Мои билеты"
  // 7. Проверить QR код
});

test('отклонение платежа', async ({ page }) => {
  // Тест неуспешной оплаты
});
```

#### qr-checkin.spec.js
```javascript
test('организатор сканирует билет студента', async ({ page }) => {
  // Режим 1: ORGANIZER_SCANS
});

test('студент сканирует QR события', async ({ page }) => {
  // Режим 2: STUDENTS_SCAN
});

test('повторное сканирование запрещено', async ({ page }) => {
  // Проверка уникальности check-in
});
```

#### services-marketplace.spec.js
```javascript
test('создание услуги', async ({ page }) => {
  // 1. Логин как студент
  // 2. Перейти в профиль
  // 3. Создать услугу
  // 4. Проверить отображение в marketplace
});

test('фильтрация услуг по категории', async ({ page }) => {
  // Тест фильтров
});
```

#### analytics.spec.js
```javascript
test('просмотр статистики организатора', async ({ page }) => {
  // Проверка дашборда
});

test('экспорт в CSV', async ({ page }) => {
  // Проверка экспорта данных
});
```

### 8.3 Frontend Services

**Создать новые сервисы в `frontend/js/services/`:**

#### paymentsService.js
```javascript
export const paymentsService = {
  createPayment: (eventId, amount) => apiClient.post('/payments/create', { eventId, amount }),
  confirmPayment: (transactionId) => apiClient.post('/payments/webhook', { transactionId, status: 'success' }),
  getMyTickets: () => apiClient.get('/payments/my-tickets'),
  getTicketById: (id) => apiClient.get(`/payments/ticket/${id}`),
  refundTicket: (id) => apiClient.post(`/payments/refund/${id}`),
};
```

#### checkinService.js
```javascript
export const checkinService = {
  validateTicket: (qrData) => apiClient.post('/checkin/validate-ticket', qrData),
  validateStudent: (qrData) => apiClient.post('/checkin/validate-student', qrData),
  getEventStats: (eventId) => apiClient.get(`/checkin/event/${eventId}/stats`),
  generateEventQR: (eventId) => apiClient.post('/checkin/generate-event-qr', { eventId }),
};
```

#### servicesService.js
```javascript
export const servicesService = {
  getAll: (filters) => apiClient.get('/services', { params: filters }),
  getById: (id) => apiClient.get(`/services/${id}`),
  create: (data) => apiClient.post('/services', data),
  update: (id, data) => apiClient.put(`/services/${id}`, data),
  delete: (id) => apiClient.delete(`/services/${id}`),
  getMyServices: () => apiClient.get('/services/my-services'),
};
```

#### analyticsService.js
```javascript
export const analyticsService = {
  getDashboard: () => apiClient.get('/analytics/dashboard'),
  getOrganizerStats: (userId) => apiClient.get(`/analytics/organizer/${userId}`),
  getStudentStats: (userId) => apiClient.get(`/analytics/student/${userId}`),
  getRevenue: () => apiClient.get('/analytics/revenue'),
  getEventStats: (eventId) => apiClient.get(`/analytics/event/${eventId}`),
};
```

#### adsService.js
```javascript
export const adsService = {
  getActive: (position) => apiClient.get('/advertisements/active', { params: { position } }),
  trackImpression: (adId) => apiClient.post(`/advertisements/${adId}/impression`),
  trackClick: (adId) => apiClient.post(`/advertisements/${adId}/click`),
};
```

---

## 📋 Итоговый Чеклист

### ✅ Фаза 1: Database (Завершено)
- [x] Prisma schema updates
- [x] Миграции применены
- [x] Seed данные созданы
- [x] Тестовые аккаунты готовы

### 🔧 Фаза 2: Backend Modules (В процессе)
- [ ] PaymentModule (mock provider)
- [ ] CheckInModule (QR validation)
- [ ] ServicesModule (marketplace)
- [ ] AnalyticsModule (статистика)

### 🎨 Фаза 3: Frontend Components
- [ ] TabNavigation компонент
- [ ] AdBanner компонент
- [ ] HeroCarousel компонент
- [ ] ServiceCard компонент
- [ ] NativeAd компонент
- [ ] HomePage реструктуризация
- [ ] ServicesPage
- [ ] TutoringPage
- [ ] ServiceDetailsPage

### 💳 Фаза 4: Платные События
- [ ] EventDetailsPage обновление
- [ ] MockPaymentPage
- [ ] TicketView компонент
- [ ] MyRegistrationsPage обновление

### 📱 Фаза 5: QR Check-in
- [ ] Install html5-qrcode
- [ ] OrganizerScannerPage (режим 1)
- [ ] Student check-in (режим 2)
- [ ] QRScannerModal компонент

### 📊 Фаза 6: Analytics
- [ ] Install recharts
- [ ] AnalyticsDashboard компонент
- [ ] Student stats в ProfilePage
- [ ] CSV export функционал

### 💰 Фаза 7: Admin Revenue
- [ ] AdminRevenuePage
- [ ] Revenue charts
- [ ] Transaction management
- [ ] Ad management

### 🧪 Фаза 8: Testing
- [ ] E2E tests (paid events)
- [ ] E2E tests (QR check-in)
- [ ] E2E tests (services)
- [ ] E2E tests (analytics)
- [ ] Frontend services
- [ ] Bug fixes и polish

---

## 📊 Progress Tracker

| Фаза | Статус | Прогресс | ETA |
|------|--------|----------|-----|
| 1. Database | ✅ Completed | 100% | 2025-11-13 |
| 2. Backend Modules | 🟡 In Progress | 0% | 2-3 дня |
| 3. Frontend Components | ⏳ Pending | 0% | 2-3 дня |
| 4. Платные События | ⏳ Pending | 0% | 2 дня |
| 5. QR Check-in | ⏳ Pending | 0% | 3 дня |
| 6. Analytics | ⏳ Pending | 0% | 2 дня |
| 7. Admin Revenue | ⏳ Pending | 0% | 1 день |
| 8. Testing | ⏳ Pending | 0% | 2 дня |

**Общий прогресс:** 12.5% (1/8 фаз завершено)

**Оценка до завершения:** 15-18 дней (3-4 недели)

---

## 🎯 Следующие Шаги

### Немедленно (Фаза 2 - День 1):
1. Создать PaymentModule структуру
2. Установить `qrcode` библиотеку
3. Реализовать mock payment endpoints
4. Создать DTOs для payment

### Затем (Фаза 2 - День 2):
1. Создать CheckInModule
2. Реализовать QR generation logic
3. Реализовать validation endpoints
4. Тестирование обоих режимов

### После (Фаза 2 - День 3):
1. Создать ServicesModule
2. Реализовать marketplace endpoints
3. Создать AnalyticsModule
4. Реализовать статистику

---

## 📝 Примечания

- **Mock данные:** Все новые функции работают с mock данными до полной интеграции
- **Kaspi интеграция:** Планируется позже, сейчас используется mock payment
- **Дизайн:** Liquid glass стиль сохраняется во всех новых компонентах
- **Тестирование:** E2E тесты важны для стабильности
- **Документация:** Обновлять CLAUDE.md по мере добавления новых фич

---

**Последнее обновление:** 2025-11-13
**Версия плана:** 1.0
**Автор:** Claude Code Assistant
