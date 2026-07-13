import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

import type { ProductDto } from '../api/products'

const STORAGE_KEY = 'drinkit.cart'

export type CartLine = {
  id: string
  productId: number
  productName: string
  imagePath: string | null
  basePrice: number
  toppingIds: number[]
  toppingsLabel: string
  toppingsPrice: number
  quantity: number
}

type CartContextValue = {
  lines: CartLine[]
  addItem: (product: ProductDto, toppingIds: number[], quantity: number) => void
  updateQuantity: (lineId: string, quantity: number) => void
  removeItem: (lineId: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

function readStoredLines(): CartLine[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []

  try {
    return JSON.parse(raw) as CartLine[]
  } catch {
    return []
  }
}

function lineKey(productId: number, toppingIds: number[]) {
  return `${productId}:${[...toppingIds].sort((a, b) => a - b).join(',')}`
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => readStoredLines())

  function persist(nextLines: CartLine[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextLines))
    setLines(nextLines)
  }

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      addItem: (product, toppingIds, quantity) => {
        const id = lineKey(product.id, toppingIds)
        const toppings = product.availableToppings.filter((topping) => toppingIds.includes(topping.id))
        const toppingsPrice = toppings.reduce((sum, topping) => sum + topping.price, 0)
        const toppingsLabel = toppings.map((topping) => topping.name).join(', ')

        const existing = lines.find((line) => line.id === id)
        const nextLines = existing
          ? lines.map((line) => (line.id === id ? { ...line, quantity: line.quantity + quantity } : line))
          : [
              ...lines,
              {
                id,
                productId: product.id,
                productName: product.name,
                imagePath: product.imagePath,
                basePrice: product.basePrice,
                toppingIds,
                toppingsLabel,
                toppingsPrice,
                quantity,
              },
            ]

        persist(nextLines)
      },
      updateQuantity: (lineId, quantity) => {
        if (quantity <= 0) {
          persist(lines.filter((line) => line.id !== lineId))
          return
        }
        persist(lines.map((line) => (line.id === lineId ? { ...line, quantity } : line)))
      },
      removeItem: (lineId) => {
        persist(lines.filter((line) => line.id !== lineId))
      },
      clear: () => {
        persist([])
      },
    }),
    [lines],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
