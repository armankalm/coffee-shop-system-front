import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { ApiError, resolveAssetUrl } from '../api/client'
import type { ProductDto } from '../api/products'
import { getProductById } from '../api/products'
import { HScroll } from '../components'
import heroFallback from '../assets/hero.png'
import styles from './Screens.module.css'

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; product: ProductDto }

function formatMoney(amount: number) {
  return `${amount.toLocaleString('ru-RU')} ₸`
}

export function ProductScreen() {
  const { productId } = useParams()
  const [state, setState] = useState<LoadState>({ status: 'loading' })

  useEffect(() => {
    if (!productId) return

    let cancelled = false

    getProductById(Number(productId))
      .then((data) => {
        if (!cancelled) setState({ status: 'ready', product: data })
      })
      .catch((err) => {
        if (!cancelled) {
          setState({
            status: 'error',
            message: err instanceof ApiError ? err.message : 'Не удалось загрузить товар.',
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [productId])

  if (state.status === 'loading') {
    return (
      <section className={`${styles.screen} ${styles.productScreen}`}>
        <p className={styles.productDescription}>Загружаем товар…</p>
      </section>
    )
  }

  if (state.status === 'error') {
    return (
      <section className={`${styles.screen} ${styles.productScreen}`}>
        <p className={styles.productDescription}>{state.message}</p>
        <Link to="/catalog">Вернуться в каталог</Link>
      </section>
    )
  }

  const { product } = state

  const toppingsByType = new Map<string, typeof product.availableToppings>()
  for (const topping of product.availableToppings) {
    const group = toppingsByType.get(topping.typeNameRu) ?? []
    group.push(topping)
    toppingsByType.set(topping.typeNameRu, group)
  }

  return (
    <section className={`${styles.screen} ${styles.productScreen}`} aria-labelledby="product-title">
      <div className={styles.productHero}>
        <img
          className={styles.productHeroImage}
          src={resolveAssetUrl(product.imagePath) ?? heroFallback}
          alt={product.name}
          draggable={false}
        />
        <div className={styles.productHeroShade} aria-hidden="true" />

        <div className={styles.productTopControls}>
          <button className={styles.productIconButton} type="button" aria-label="Добавить в избранное">
            ♡
          </button>
          <h1 className={styles.productTopTitle} id="product-title">
            {product.name}
          </h1>
          <Link className={styles.productIconButton} to="/catalog" aria-label="Закрыть карточку товара">
            ×
          </Link>
        </div>

        <div className={styles.productHeroCopy}>
          <p className={styles.productPrice}>{formatMoney(product.basePrice)}</p>
        </div>
      </div>

      <div className={styles.productContent}>
        {toppingsByType.size > 0 ? (
          <HScroll className={styles.productModifierScroll} aria-label="Топинги">
            <div className={styles.productModifierRail}>
              {Array.from(toppingsByType.entries()).map(([typeTitle, toppings]) => (
                <div className={styles.productModifierCard} key={typeTitle}>
                  <span className={styles.productModifierTitle}>{typeTitle}</span>
                  <span className={styles.productModifierFooter}>
                    <span className={styles.productModifierHint}>
                      {toppings.map((topping) => topping.name).join(', ')}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </HScroll>
        ) : null}
      </div>

      <div className={styles.productBottomBar}>
        <Link className={styles.productAddButton} to="/cart" aria-label={`Добавить ${product.name} в корзину`}>
          + {formatMoney(product.basePrice)}
        </Link>
      </div>
    </section>
  )
}
