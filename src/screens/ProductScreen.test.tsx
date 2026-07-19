// @vitest-environment jsdom

import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { cleanupDocument, clickElement, renderIntoDocument, waitFor } from '../testUtils/dom'
import { ProductScreen } from './ProductScreen'

const mockProductsApi = vi.hoisted(() => ({
  getProductById: vi.fn(),
}))

const mockCart = vi.hoisted(() => ({
  addItem: vi.fn(),
}))

vi.mock('../api/products', () => mockProductsApi)
vi.mock('../cart/CartContext', () => ({
  useCart: () => mockCart,
}))
vi.mock('../favorites/FavoritesContext', () => ({
  useFavorites: () => ({
    isFavorite: () => false,
    toggleFavorite: vi.fn(),
  }),
}))
vi.mock('../shop/ShopContext', () => ({
  useShop: () => ({
    shop: {
      id: 7,
      name: 'Mega Park',
    },
  }),
}))

describe('ProductScreen', () => {
  beforeEach(() => {
    mockCart.addItem.mockReset()
    mockProductsApi.getProductById.mockReset()
    mockProductsApi.getProductById.mockResolvedValue({
      id: 10,
      name: 'Iced latte',
      category: 'coffee',
      categoryNameRu: 'Coffee',
      basePrice: 2600,
      available: true,
      imagePath: null,
      description: null,
      availableToppings: [],
    })
  })

  afterEach(async () => {
    await cleanupDocument()
  })

  it('adds the product to the selected shop cart', async () => {
    const { container } = await renderIntoDocument(
      <MemoryRouter initialEntries={['/product/10']}>
        <Routes>
          <Route path="/product/:productId" element={<ProductScreen />} />
          <Route path="/cart" element={<span>cart</span>} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(container.textContent).toContain('Iced latte')
    })

    const buttons = Array.from(container.querySelectorAll('button'))
    const addButton = buttons[buttons.length - 1]
    expect(addButton).not.toBeUndefined()
    await clickElement(addButton!)

    expect(mockCart.addItem).toHaveBeenCalledWith(
      expect.objectContaining({ id: 10, name: 'Iced latte' }),
      [],
      1,
      7,
    )
  })
})
