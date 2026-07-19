import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { addFavorite, getFavorites, removeFavorite } from '../api/favorites'
import type { ProductDto } from '../api/products'
import { useAuth } from '../auth/AuthContext'

type FavoritesContextValue = {
  favoriteProducts: ProductDto[]
  favoriteProductIds: number[]
  isFavorite: (productId: number) => boolean
  toggleFavorite: (product: ProductDto) => void
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)
const emptyFavoriteProducts: ProductDto[] = []

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const [favoriteProducts, setFavoriteProducts] = useState<ProductDto[]>([])

  useEffect(() => {
    if (!session) {
      return
    }

    let cancelled = false

    getFavorites()
      .then((favorites) => {
        if (!cancelled) setFavoriteProducts(favorites.map((favorite) => favorite.product))
      })
      .catch(() => {
        if (!cancelled) setFavoriteProducts([])
      })

    return () => {
      cancelled = true
    }
  }, [session])

  const visibleFavoriteProducts = session ? favoriteProducts : emptyFavoriteProducts

  const toggleFavorite = useCallback(
    (product: ProductDto) => {
      const isCurrentlyFavorite = visibleFavoriteProducts.some((entry) => entry.id === product.id)

      if (isCurrentlyFavorite) {
        setFavoriteProducts((current) => current.filter((entry) => entry.id !== product.id))
        removeFavorite(product.id).catch(() => {
          setFavoriteProducts((current) => (current.some((entry) => entry.id === product.id) ? current : [...current, product]))
        })
        return
      }

      setFavoriteProducts((current) => [...current, product])
      addFavorite(product.id).catch(() => {
        setFavoriteProducts((current) => current.filter((entry) => entry.id !== product.id))
      })
    },
    [visibleFavoriteProducts],
  )

  const favoriteProductIds = useMemo(
    () => visibleFavoriteProducts.map((product) => product.id),
    [visibleFavoriteProducts],
  )

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favoriteProducts: visibleFavoriteProducts,
      favoriteProductIds,
      isFavorite: (productId) => favoriteProductIds.includes(productId),
      toggleFavorite,
    }),
    [visibleFavoriteProducts, favoriteProductIds, toggleFavorite],
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
