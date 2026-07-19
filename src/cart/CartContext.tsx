import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import type { ProductDto } from '../api/products'

const STORAGE_KEY = 'drinkit.cart'

export type CartLine = {
  id: string
  shopId: number
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
  addItem: (product: ProductDto, toppingIds: number[], quantity: number, shopId: number) => void
  updateQuantity: (lineId: string, quantity: number) => void
  removeItem: (lineId: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

function readStoredLines(): CartLine[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []

    return parsed.filter(
      (line): line is CartLine =>
        typeof line === 'object' &&
        line !== null &&
        typeof (line as CartLine).shopId === 'number',
    )
  } catch {
    return []
  }
}

function lineKey(shopId: number, productId: number, toppingIds: number[]) {
  return `${shopId}:${productId}:${[...toppingIds].sort((a, b) => a - b).join(',')}`
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => readStoredLines())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  }, [lines])

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      addItem: (product, toppingIds, quantity, shopId) => {
        const id = lineKey(shopId, product.id, toppingIds)
        const toppings = product.availableToppings.filter((topping) => toppingIds.includes(topping.id))
        const toppingsPrice = toppings.reduce((sum, topping) => sum + topping.price, 0)
        const toppingsLabel = toppings.map((topping) => topping.name).join(', ')

        setLines((currentLines) => {
          const existing = currentLines.find((line) => line.id === id)

          return existing
            ? currentLines.map((line) => (line.id === id ? { ...line, quantity: line.quantity + quantity } : line))
            : [
                ...currentLines,
                {
                  id,
                  shopId,
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
        })
      },
      updateQuantity: (lineId, quantity) => {
        if (quantity <= 0) {
          setLines((currentLines) => currentLines.filter((line) => line.id !== lineId))
          return
        }
        setLines((currentLines) => currentLines.map((line) => (line.id === lineId ? { ...line, quantity } : line)))
      },
      removeItem: (lineId) => {
        setLines((currentLines) => currentLines.filter((line) => line.id !== lineId))
      },
      clear: () => {
        setLines([])
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
