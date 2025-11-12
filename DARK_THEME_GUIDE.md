# 🎨 Dark Theme Implementation Guide - MNU Events

## ✅ Что уже готово:

1. ✅ **Цветовая палитра** обновлена в `frontend/js/utils/constants.js`
2. ✅ **Глобальные стили** применены в `frontend/css/globals.css`
3. ✅ **BottomNavigation** компонент создан (`frontend/js/components/BottomNavigation.jsx`)
4. ✅ **FilterSheet** компонент создан (`frontend/js/components/FilterSheet.jsx`)

## 🎯 Что нужно сделать:

### 1. Добавить BottomNavigation в Layout

**Файл:** `frontend/js/components/Layout.jsx`

```jsx
// В начале файла добавьте импорт
import BottomNavigation from './BottomNavigation';

// В конце компонента Layout, перед closing tag, добавьте:
export default function Layout({ children }) {
  // ... существующий код ...

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Хедер */}
      <header className={/* ... */}>
        {/* Существующий код хедера */}
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Bottom Navigation для мобильных */}
      <BottomNavigation />
    </div>
  );
}
```

---

### 2. Обновить цвета в Layout.jsx

**Заменить:**

```jsx
// ❌ Старый светлый хедер
<header className="bg-white text-gray-900 border-b">

// ✅ Новый темный хедер
<header className="bg-[#1a1a1a] text-white border-b border-[#2a2a2a]">
```

**Применить ко всем элементам:**
- Фон: `bg-[#0a0a0a]` (очень темный) или `bg-[#1a1a1a]` (карточки)
- Текст: `text-white` (основной), `text-[#a0a0a0]` (вторичный)
- Кнопки: `bg-[#d62e1f] hover:bg-[#b91c1c] text-white`
- Границы: `border-[#2a2a2a]`

---

### 3. Рефакторинг HomePage → Dashboard

**Файл:** `frontend/js/pages/HomePage.jsx`

#### 3.1. Hero Section (оставить):
```jsx
<section className="relative h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
  <div className="absolute inset-0 bg-[url('/images/backg.jpg')] bg-cover bg-center opacity-20" />
  <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
    <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6">
      Discover <span className="text-[#d62e1f]">Events</span>
    </h1>
    <p className="text-xl md:text-2xl text-[#a0a0a0] mb-8 max-w-2xl text-center">
      Join the best university events at MNU
    </p>
    <button className="bg-[#d62e1f] hover:bg-[#b91c1c] text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors">
      Explore Events
    </button>
  </div>
</section>
```

#### 3.2. My Upcoming Events (Horizontal Scroll):
```jsx
<section className="py-16 px-4 bg-[#0a0a0a]">
  <div className="max-w-7xl mx-auto">
    <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-8">
      My <span className="text-[#d62e1f]">Upcoming Events</span>
    </h2>

    {/* Horizontal Scroll Container */}
    <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
      <div className="flex gap-6 min-w-max">
        {myEvents.map((event) => (
          <div
            key={event.id}
            className="w-80 bg-[#1a1a1a] rounded-lg overflow-hidden border border-[#2a2a2a] hover:border-[#d62e1f] transition-colors cursor-pointer"
            onClick={() => navigate(`/events/${event.id}`)}
          >
            <img src={event.imageUrl || '/images/event-placeholder.jpg'} alt={event.title} className="w-full h-48 object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
              <p className="text-[#a0a0a0] text-sm mb-4">{formatDate(event.startDate)}</p>
              <span className="inline-block bg-[#d62e1f] text-white px-3 py-1 rounded text-sm font-semibold">
                {event.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>

{/* Add to CSS or Tailwind config */}
<style jsx>{`
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`}</style>
```

#### 3.3. Featured Events (Same structure):
Повторить ту же структуру для "Featured Events"

---

### 4. Рефакторинг EventsPage

**Файл:** `frontend/js/pages/EventsPage.jsx`

#### 4.1. Header с фильтрами (Sticky):
```jsx
import { useState } from 'react';
import FilterSheet from '../components/FilterSheet';

export default function EventsPage() {
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('ALL');

  const categories = ['ALL', 'ACADEMIC', 'SPORTS', 'CULTURAL', 'TECH', 'SOCIAL', 'CAREER'];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero + Filters (Sticky) */}
      <div className="sticky top-0 z-30 bg-[#0a0a0a] border-b border-[#2a2a2a]">
        {/* Hero */}
        <div className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4">
              Discover <span className="text-[#d62e1f]">Events</span>
            </h1>
            <p className="text-xl text-[#a0a0a0]">Find your next adventure</p>
          </div>
        </div>

        {/* Filters */}
        <div className="py-4 px-4 bg-[#1a1a1a]">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            {/* Horizontal Scroll Pills */}
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 min-w-max">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full font-semibold transition-colors whitespace-nowrap ${
                      activeCategory === cat
                        ? 'bg-[#d62e1f] text-white'
                        : 'bg-[#2a2a2a] text-[#a0a0a0] hover:bg-[#3a3a3a]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Icon (Mobile) */}
            <button
              onClick={() => setFilterSheetOpen(true)}
              className="md:hidden bg-[#d62e1f] p-3 rounded-lg"
              aria-label="Open filters"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Event Cards */}
          </div>
        </div>
      </div>

      {/* Filter Bottom Sheet */}
      <FilterSheet
        isOpen={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        title="Filter Events"
      >
        {/* Advanced filter options */}
        <div className="space-y-6">
          <div>
            <label className="block text-white font-semibold mb-3">Status</label>
            <div className="space-y-2">
              {['ALL', 'UPCOMING', 'ONGOING', 'COMPLETED'].map((status) => (
                <label key={status} className="flex items-center text-[#a0a0a0] hover:text-white cursor-pointer">
                  <input type="checkbox" className="mr-3" />
                  {status}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-white font-semibold mb-3">Date Range</label>
            <input type="date" className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg px-4 py-2 text-white" />
          </div>
        </div>
      </FilterSheet>
    </div>
  );
}
```

---

### 5. Обновить карточки событий (полностью кликабельные):

```jsx
// ❌ Старый способ (кнопка внутри)
<div className="card">
  <h3>{event.title}</h3>
  <button onClick={() => navigate(`/events/${event.id}`)}>View Details</button>
</div>

// ✅ Новый способ (вся карточка кликабельная)
<div
  className="bg-[#1a1a1a] rounded-lg overflow-hidden border border-[#2a2a2a] hover:border-[#d62e1f] transition-all cursor-pointer group"
  onClick={() => navigate(`/events/${event.id}`)}
>
  <div className="relative">
    <img src={event.imageUrl} alt={event.title} className="w-full h-48 object-cover" />
    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
  </div>

  <div className="p-6">
    <div className="flex items-center gap-2 mb-3">
      <span className="inline-block bg-[#d62e1f] text-white px-3 py-1 rounded text-xs font-bold uppercase">
        {event.category}
      </span>
      <span className="text-[#a0a0a0] text-sm">{formatDate(event.startDate)}</span>
    </div>

    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#d62e1f] transition-colors">
      {event.title}
    </h3>

    <p className="text-[#a0a0a0] text-sm mb-4 line-clamp-2">{event.description}</p>

    <div className="flex items-center justify-between">
      <div className="flex items-center text-[#a0a0a0] text-sm">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {event.location}
      </div>

      <div className="flex items-center text-[#a0a0a0] text-sm">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        {event._count?.registrations || 0} / {event.capacity}
      </div>
    </div>
  </div>
</div>
```

---

### 6. ClubsPage - Та же структура

Применить те же изменения к `ClubsPage.jsx`:
- Крупный H1 заголовок
- Горизонтальные фильтры
- FilterSheet для мобильных
- Темные карточки с красными акцентами

---

## 🎨 Быстрая таблица цветов:

| Элемент | Tailwind Class | Hex |
|---------|---------------|-----|
| **Фон (основной)** | `bg-[#0a0a0a]` | #0a0a0a |
| **Фон (карточки)** | `bg-[#1a1a1a]` | #1a1a1a |
| **Фон (hover)** | `bg-[#252525]` | #252525 |
| **Текст (основной)** | `text-white` | #ffffff |
| **Текст (вторичный)** | `text-[#a0a0a0]` | #a0a0a0 |
| **Текст (приглушенный)** | `text-[#666666]` | #666666 |
| **Акцент (MNU Red)** | `bg-[#d62e1f]` | #d62e1f |
| **Акцент (hover)** | `bg-[#b91c1c]` | #b91c1c |
| **Границы** | `border-[#2a2a2a]` | #2a2a2a |

---

## 📱 Mobile-First подход:

1. **Скрыть верхнюю навигацию на мобильных:**
   ```jsx
   <nav className="hidden md:flex">
     {/* Desktop navigation */}
   </nav>
   ```

2. **BottomNavigation видна только на мобильных:**
   Уже реализовано в компоненте `BottomNavigation.jsx`

3. **Responsive Typography:**
   ```jsx
   <h1 className="text-4xl md:text-6xl font-extrabold">
   ```

---

## ✅ Чеклист:

- [ ] Добавить `<BottomNavigation />` в Layout.jsx
- [ ] Обновить цвета хедера в Layout.jsx
- [ ] Рефакторить HomePage → Dashboard (Hero + 2 horizontal scrolls)
- [ ] Рефакторить EventsPage (Sticky filters + FilterSheet)
- [ ] Рефакторить ClubsPage (аналогично EventsPage)
- [ ] Обновить все карточки на полностью кликабельные
- [ ] Тестировать на мобильных устройствах

---

## 🚀 Готово для продакшена:

После применения всех изменений:
1. Проверьте на мобильных (DevTools → Mobile view)
2. Проверьте липкий header на EventsPage
3. Убедитесь, что BottomNavigation работает
4. Проверьте, что FilterSheet открывается

**Результат:** Премиальная темная тема с красным акцентом MNU, адаптивная под все устройства! 🎉
