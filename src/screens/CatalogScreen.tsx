import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { ApiError, resolveAssetUrl } from '../api/client'
import type { ProductDto } from '../api/products'
import { getProducts } from '../api/products'
import { HScroll, ProductCard } from '../components'
import { useShop } from '../shop/ShopContext'
import heroFallback from '../assets/hero.png'
import styles from './Screens.module.css'

type CategoryOption = {
  code: string
  title: string
}

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; products: ProductDto[] }

function formatMoney(amount: number) {
  return `${amount.toLocaleString('ru-RU')} ₸`
}

export function CatalogScreen() {
  const navigate = useNavigate()
  const { shop } = useShop()

  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [activeCategoryCode, setActiveCategoryCode] = useState<string | null>(null)

  useEffect(() => {
    if (!shop) return

    let cancelled = false

    getProducts(shop.id)
      .then((data) => {
        if (cancelled) return
        setState({ status: 'ready', products: data })
        setActiveCategoryCode((current) => current ?? data[0]?.category ?? null)
      })
      .catch((err) => {
        if (!cancelled) {
          setState({
            status: 'error',
            message: err instanceof ApiError ? err.message : 'Не удалось загрузить меню.',
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [shop])

  const products = useMemo(() => (state.status === 'ready' ? state.products : []), [state])

  const categories = useMemo<CategoryOption[]>(() => {
    const seen = new Map<string, string>()
    for (const product of products) {
      if (!seen.has(product.category)) seen.set(product.category, product.categoryNameRu)
    }
    return Array.from(seen, ([code, title]) => ({ code, title }))
  }, [products])

  const activeCategory = categories.find((category) => category.code === activeCategoryCode) ?? categories[0]

  const visibleProducts = useMemo(
    () => products.filter((product) => product.category === activeCategory?.code),
    [products, activeCategory?.code],
  )

  if (!shop) {
    return <Navigate to="/locations" replace />
  }

  return (
    <section className={styles.screen} aria-labelledby="catalog-title">
      <header className={styles.header}>
        <p className={styles.eyebrow}>{shop.name}</p>
        <h1 className={styles.title} id="catalog-title">
          Каталог
        </h1>
      </header>

      {state.status === 'loading' ? <p className={styles.muted}>Загружаем меню…</p> : null}
      {state.status === 'error' ? <p className={styles.muted}>{state.message}</p> : null}

      {state.status === 'ready' ? (
        <>
          <HScroll aria-label="Категории">
            <div className={styles.categoryRail} role="tablist" aria-label="Product categories">
              {categories.map((category) => {
                const isActive = category.code === activeCategory?.code

                return (
                  <button
                    aria-controls="catalog-products"
                    aria-selected={isActive}
                    className={`${styles.categoryTab} ${isActive ? styles.activeCategoryTab : ''}`}
                    id={`catalog-tab-${category.code}`}
                    key={category.code}
                    onClick={() => setActiveCategoryCode(category.code)}
                    role="tab"
                    type="button"
                  >
                    {category.title}
                  </button>
                )
              })}
            </div>
          </HScroll>

          <p className={styles.categorySubtitle}>{activeCategory?.title}</p>

          <div
            aria-labelledby={activeCategory ? `catalog-tab-${activeCategory.code}` : undefined}
            className={styles.grid}
            id="catalog-products"
            role="tabpanel"
          >
            {visibleProducts.map((product) => (
              <ProductCard
                aria-label={`Open ${product.name}`}
                className={styles.productCard}
                imageAlt={product.name}
                imageSrc={resolveAssetUrl(product.imagePath) ?? heroFallback}
                key={product.id}
                onClick={() => navigate(`/product/${product.id}`)}
                price={formatMoney(product.basePrice)}
                title={product.name}
              />
            ))}
          </div>

          {visibleProducts.length === 0 ? <p className={styles.muted}>В этой категории пока пусто.</p> : null}
        </>
      ) : null}

      <div className={styles.actions}>
        <Link className={styles.ghostButton} to="/locations">
          Адрес
        </Link>
        <Link className={styles.ghostButton} to="/profile">
          Профиль
        </Link>
        <Link className={styles.linkButton} to="/cart">
          Корзина
        </Link>
      </div>
    </section>
  )
}
