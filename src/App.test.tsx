import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import App from './App'
import { featuredProduct } from './mocks'

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
    expect(markup).toContain('Выбор адреса')
    expect(markup).toContain('ТРЦ Mega Park')
    expect(markup).toContain('href="/catalog"')
  })

  it('renders all five route skeletons', () => {
    expect(renderRoute('/profile')).toContain('История заказов')
    expect(renderRoute('/catalog')).toContain('Каталог')
    expect(renderRoute(`/product/${featuredProduct.id}`)).toContain(featuredProduct.title)
    expect(renderRoute('/cart')).toContain('Вместе вкуснее')
  })
})
