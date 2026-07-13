import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import App from './App'
import { AuthProvider } from './auth/AuthContext'
import { ShopProvider } from './shop/ShopContext'

class MemoryStorage implements Storage {
  private store = new Map<string, string>()

  get length() {
    return this.store.size
  }

  clear = () => this.store.clear()
  getItem = (key: string) => this.store.get(key) ?? null
  key = (index: number) => Array.from(this.store.keys())[index] ?? null
  removeItem = (key: string) => void this.store.delete(key)
  setItem = (key: string, value: string) => void this.store.set(key, value)
}

globalThis.localStorage ??= new MemoryStorage()

const testShop = {
  id: 1,
  name: 'ТРЦ Mega Park',
  city: { id: 1, name: 'Алматы', region: 'Алматы' },
  address: 'ул. Розыбакиева, 247А',
  status: 'ACTIVE',
  statusNameRu: 'Открыта',
}

function renderRoute(route: string) {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <ShopProvider>
          <App />
        </ShopProvider>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('App', () => {
  beforeEach(() => {
    localStorage.setItem(
      'drinkit.auth',
      JSON.stringify({ accessToken: 'test-access', refreshToken: 'test-refresh', email: 'test@example.com', role: 'USER' }),
    )
    localStorage.removeItem('drinkit.shop')
  })

  it('renders the location route inside the safe-area layout', () => {
    const markup = renderRoute('/locations')

    expect(markup).toContain('safe-area')
    expect(markup).toContain('Выбор места заказа')
    expect(markup).toContain('placeholder="Поиск"')
    expect(markup).toContain('aria-label="Открыть карту"')
    expect(markup).toContain('aria-label="Закрыть выбор адреса"')
    expect(markup).toContain('aria-label="Найти ближайшую точку"')
  })

  it('does not render the catalog when no shop is selected yet', () => {
    expect(renderRoute('/catalog')).not.toContain('Каталог')
  })

  it('shows a loading state for the catalog once a shop is selected', () => {
    localStorage.setItem('drinkit.shop', JSON.stringify(testShop))

    const markup = renderRoute('/catalog')

    expect(markup).toContain('Каталог')
    expect(markup).toContain(testShop.name)
    expect(markup).toContain('Загружаем меню')
  })

  it('shows a loading state for the product detail screen', () => {
    const markup = renderRoute('/product/1')

    expect(markup).toContain('Загружаем товар')
  })

  it('renders the completed profile screen layout', () => {
    const markup = renderRoute('/profile')

    expect(markup).toContain('aria-label="Назад"')
    expect(markup).toContain('aria-label="Открыть чат"')
    expect(markup).toContain('Алия Садыкова')
    expect(markup).toContain('+7 701 555 24 10')
    expect(markup).toContain('hide-scrollbar')
    expect(markup).toContain('Бонусы недели')
    expect(markup).toContain('08.07.2026')
    expect(markup).toContain('ТРЦ Mega Park')
    expect(markup).toContain('aria-label="Напитки в заказе"')
    expect(markup).toContain('aria-label="Повторить заказ"')
  })

  it('renders the completed cart screen layout', () => {
    const markup = renderRoute('/cart')

    expect(markup).toContain('Вместе вкуснее')
    expect(markup).toContain('aria-label="Очистить корзину"')
  })

  it('does not render protected screen content for unauthenticated visitors', () => {
    localStorage.removeItem('drinkit.auth')

    const markup = renderRoute('/profile')

    expect(markup).not.toContain('История заказов')
  })
})
