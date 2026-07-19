// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import type { ProductDto } from '../api/products'
import { cleanupDocument, clickElement, renderIntoDocument, waitFor } from '../testUtils/dom'
import { CartProvider, useCart } from './CartContext'

const baseProduct: ProductDto = {
  id: 10,
  name: 'Iced latte',
  category: 'coffee',
  categoryNameRu: 'Coffee',
  basePrice: 2600,
  available: true,
  imagePath: null,
  description: null,
  availableToppings: [],
}

const secondProduct: ProductDto = {
  ...baseProduct,
  id: 11,
  name: 'Flat white',
  basePrice: 1800,
}

function CartProbe() {
  const { addItem, lines } = useCart()

  return (
    <div>
      <output>
        {lines.map((line) => `${line.shopId}:${line.productId}:${line.quantity}`).join('|') || 'empty'}
      </output>
      <button
        type="button"
        onClick={() => {
          addItem(baseProduct, [], 1, 1)
          addItem(secondProduct, [], 2, 1)
        }}
      >
        repeat
      </button>
      <button
        type="button"
        onClick={() => {
          addItem(baseProduct, [], 1, 2)
        }}
      >
        other shop
      </button>
    </div>
  )
}

describe('CartProvider', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(async () => {
    await cleanupDocument()
  })

  it('applies multiple addItem calls from one event without losing earlier lines', async () => {
    const { container } = await renderIntoDocument(
      <CartProvider>
        <CartProbe />
      </CartProvider>,
    )

    await clickElement(container.querySelector('button')!)

    await waitFor(() => {
      expect(container.textContent).toContain('1:10:1|1:11:2')
    })
  })

  it('stores shop ids in cart line keys', async () => {
    const { container } = await renderIntoDocument(
      <CartProvider>
        <CartProbe />
      </CartProvider>,
    )
    const buttons = container.querySelectorAll('button')

    await clickElement(buttons[0]!)
    await clickElement(buttons[1]!)

    await waitFor(() => {
      expect(container.textContent).toContain('1:10:1|1:11:2|2:10:1')
    })
  })
})
