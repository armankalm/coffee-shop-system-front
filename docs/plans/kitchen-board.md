# Китчен-боард: управление позициями заказов (админ)

Реализация трёх страниц отслеживания позиций заказов (`/orders/new`, `/orders/in-progress`, `/orders/ready`) для админ/бариста-аккаунта. Один переиспользуемый Grid-компонент, общий Context для состояния позиций, гейтинг по роли, анимации через framer-motion.

## Ключевые решения (из brainstorming)
- **Данные:** моки с чётким API-интерфейсом (`src/api/positions.ts`), чтобы позже подключить реальный бэк без переписывания UI.
- **Гейтинг:** существующий `RequireAuth` + новый `RequireRole` по праву `orders:update-status`. Доступ имеют `BARISTA`, `MANAGER`, `ADMIN` (у `MANAGER`/`ADMIN` — `orders:*`, у `BARISTA` — `orders:update-status`). Роль `USER` (`orders:read/create/cancel`) доступа не имеет.
- **Навигация:** общий админ-layout с верхними табами (NavLink) между тремя роутами.
- **Стейт:** общий `KitchenBoardContext` (по образцу `CartContext`/`AuthContext`) с методом `advancePosition()` — смена статуса видна на всех табах.
- **Анимации:** framer-motion (`AnimatePresence` + layout animations) для плавного fade-out и перекладки грида.

## Validation Commands
- `npm run lint`
- `npm run build`
- `npm test`

---

### Task 1: Типы и mock-API позиций
- [x] Добавить тип `OrderPosition` (id, orderNumber, title, status, createdAt, comment?) и статусы `NEW | IN_PROGRESS | READY | COMPLETED` в `src/types.ts`
- [x] Создать `src/api/positions.ts` с сигнатурами `getPositions(): Promise<OrderPosition[]>` и `advancePositionStatus(id: string): Promise<OrderPosition>` (пока mock, но интерфейс под будущий бэк)
- [x] Внутри mock-API реализовать логику перехода статусов: `NEW → IN_PROGRESS → READY → COMPLETED`
- [x] Добавить в `src/mocks/index.ts` массив `orderPositions` (8-12 штук с разными статусами, разным `createdAt`, часть с `comment`)
- [x] Экспортировать хелпер `nextStatus(status)` для переиспользования в UI и Context

### Task 2: KitchenBoardContext (общий стейт)
- [x] Создать `src/kitchen/KitchenBoardContext.tsx` по образцу `CartContext.tsx`
- [x] Хранить `positions: OrderPosition[]`, загружать через `getPositions()` при монтировании (loading/error стейт)
- [x] Реализовать `advancePosition(id)`: оптимистичное обновление статуса + вызов `advancePositionStatus(id)`, откат при ошибке
- [x] Добавить селектор `positionsByStatus(status)` с сортировкой FIFO (от старых к новым по `createdAt`)
- [x] Добавить счётчики `counts: Record<status, number>` для табов
- [x] Экспортировать хук `useKitchenBoard()` с проверкой провайдера
- [x] Обернуть провайдером админ-роуты (не всё приложение)

### Task 3: Гейтинг по праву (RequireRole)
- [ ] Создать `src/auth/permissions.ts`: маппинг `role → permissions[]` по данным бэка (`USER: orders:read/create/cancel`; `BARISTA: orders:read/update-status/print`; `MANAGER`/`ADMIN`: `orders:*` и др.), хелпер `hasPermission(role, permission)` с поддержкой wildcard (`orders:*` покрывает `orders:update-status`)
- [ ] Определить константу `KITCHEN_BOARD_PERMISSION = 'orders:update-status'`
- [ ] Создать `src/auth/RequireRole.tsx` — принимает `permission: string`, использует `useAuth()`, при отсутствии права делает `<Navigate>` на главную
- [ ] Убедиться, что `RequireRole` монтируется внутри `RequireAuth` (сначала авторизация, потом право)
- [ ] Примечание: сессия сейчас несёт только `role: string` (в `AuthResponse`/`AuthSession`), массива permissions нет — поэтому право выводится из роли на клиенте. Если бэк начнёт отдавать `permissions`, `hasPermission` переключается на них без изменения UI.

### Task 4: Админ-layout с табами
- [ ] Создать `src/layout/KitchenLayout.tsx` + `KitchenLayout.module.css` — контейнер с верхней панелью табов и `<Outlet />`
- [ ] Табы через `NavLink` на `/orders/new`, `/orders/in-progress`, `/orders/ready` с активным состоянием
- [ ] Вывести в табах счётчики позиций из `useKitchenBoard().counts` (напр. «Новые · 3»)
- [ ] Layout без клиентской нижней навигации (`BottomNav`), адаптирован под планшет
- [ ] Обернуть layout провайдером `KitchenBoardProvider` (внутри `RequireRole`)

### Task 5: Переиспользуемый OrderPositionsGrid
- [ ] Создать `src/components/OrderPositionsGrid/OrderPositionsGrid.tsx` + `.module.css` + `index.ts`
- [ ] Пропсы: `statusFilter`, `positions`, `onPositionClick(id)`
- [ ] CSS Grid: `repeat(4, minmax(0, 1fr))` на Full HD, `gap: 16px`, адаптив 2-3 на планшете, 1-2 на мобильном
- [ ] Отфильтрованный и FIFO-отсортированный список отдаётся снаружи (из Context), Grid только рендерит

### Task 6: Карточка позиции (PositionCard)
- [ ] Создать `src/components/PositionCard/PositionCard.tsx` + `.module.css` + `index.ts`
- [ ] Крупный жирный заголовок (`title`), мета снизу: `orderNumber` + таймер «прошло с createdAt»
- [ ] Таймер: хук `useElapsedTime(createdAt)` с обновлением раз в ~30 сек (или мемоизированный интервал на уровне грида)
- [ ] Ховер-эффект: плавная смена фона/тени (CSS transition), крупная кликабельная зона
- [ ] Комментарий (`comment`): выделять фоновым цветом/иконкой внимания, если задан
- [ ] Клик по карточке вызывает `onPositionClick(id)`

### Task 7: Три страницы (роуты)
- [ ] Создать `src/screens/kitchen/NewOrdersScreen.tsx` — `statusFilter=NEW`, клик → `advancePosition` (в `IN_PROGRESS`)
- [ ] Создать `src/screens/kitchen/InProgressOrdersScreen.tsx` — `statusFilter=IN_PROGRESS`, клик → `READY`
- [ ] Создать `src/screens/kitchen/ReadyOrdersScreen.tsx` — `statusFilter=READY`, клик → `COMPLETED` (исчезает с доски)
- [ ] Каждая страница берёт позиции из `useKitchenBoard().positionsByStatus(status)` и рендерит `OrderPositionsGrid`
- [ ] Экспортировать экраны через barrel (`src/screens/index.ts` или отдельный `kitchen/index.ts`)

### Task 8: EmptyState (пустая очередь)
- [ ] Создать `src/components/EmptyState/EmptyState.tsx` + `.module.css` + `index.ts`
- [ ] Заглушка «Очередь пуста» с иконкой/иллюстрацией, принимает `title`/`description` пропсами
- [ ] Показывать в `OrderPositionsGrid`, когда `positions.length === 0`

### Task 9: Анимации (framer-motion)
- [ ] Установить `framer-motion` (`npm i framer-motion`)
- [ ] Обернуть карточки в `OrderPositionsGrid` через `<AnimatePresence>` + `motion.div` с `layout`
- [ ] Настроить `exit` (fade-out + scale) при удалении карточки со страницы
- [ ] Проверить плавную перекладку оставшихся карточек грида без резких скачков

### Task 10: Роуты и интеграция в App
- [ ] Добавить в `src/App.tsx` группу роутов `/orders/*` внутри `RequireAuth` → `RequireRole` → `KitchenLayout`
- [ ] Роут `/orders` редиректит на `/orders/new`
- [ ] Убедиться, что клиентские роуты и `AppLayout` не затронуты
- [ ] Проверить редирект не-админа при попытке зайти на `/orders/new`

### Task 11: Тесты и финальная проверка
- [ ] Тест: `advancePosition` переводит статус по цепочке и убирает позицию из старого статуса
- [ ] Тест: `positionsByStatus` фильтрует и сортирует FIFO
- [ ] Тест: `OrderPositionsGrid` рендерит `EmptyState` при пустом списке
- [ ] Прогнать `npm run lint`, `npm run build`, `npm test` — всё зелёное
