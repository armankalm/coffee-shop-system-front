import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import App from './App'
import { categories, featuredProduct, formatMoney, products } from './mocks'

function renderRoute(route: string) {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  )
}

describe('App', () => {
  it('renders the location route inside the safe-area layout', () => {
    const markup = renderRoute('/locations')

    expect(markup).toContain('safe-area')
    expect(markup).toContain('Выбор места заказа')
    expect(markup).toContain('placeholder="Поиск"')
    expect(markup).toContain('aria-label="Открыть карту"')
    expect(markup).toContain('aria-label="Закрыть выбор адреса"')
    expect(markup).toContain('Недавние')
    expect(markup).toContain('Алматы')
    expect(markup).toContain('ТРЦ Mega Park')
    expect(markup).toContain('aria-label="Выбранная точка"')
    expect(markup).toContain('Рядом со мной')
    expect(markup).toContain('aria-label="Найти ближайшую точку"')
  })

  it('renders all five route skeletons', () => {
    expect(renderRoute('/profile')).toContain('История заказов')
    expect(renderRoute('/catalog')).toContain('Каталог')
    expect(renderRoute(`/product/${featuredProduct.id}`)).toContain(featuredProduct.title)
    expect(renderRoute('/cart')).toContain('Вместе вкуснее')
  })

  it('renders the completed catalog tabs and active category product grid', () => {
    const markup = renderRoute('/catalog')
    const activeCategory = categories[0]!
    const visibleProducts = products.filter((product) => product.categoryId === activeCategory.id)

    expect(markup).toContain('role="tablist"')
    expect(markup).toContain('role="tab"')
    expect(markup).toContain('aria-selected="true"')
    expect(markup).toContain('role="tabpanel"')
    expect(markup).toContain('id="catalog-products"')
    expect(markup).toContain(activeCategory.subtitle)

    categories.forEach((category) => {
      expect(markup).toContain(category.title)
    })

    visibleProducts.forEach((product) => {
      expect(markup).toContain(`aria-label="Open ${product.title}"`)
      expect(markup).toContain(product.title)
      expect(markup).toContain(formatMoney(product.price))

      if (product.badge) {
        expect(markup).toContain(product.badge.label)
      }
    })

    expect(markup).not.toContain(featuredProduct.title)
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
})
