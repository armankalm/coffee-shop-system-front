import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Badge, CrossSellCard, HScroll, NutritionRow, Stepper } from '../components'
import { cartItems, crossSellItems, formatMoney, paymentMethods, pickupPoints, products } from '../mocks'
import type { CartItem } from '../types'
import styles from './Screens.module.css'

export function CartScreen() {
  const [items, setItems] = useState<CartItem[]>(cartItems)

  const rows = items
    .map((item) => {
      const product = products.find((entry) => entry.id === item.productId)
      const size = product?.sizes.find((entry) => entry.id === item.sizeId)

      return product ? { item, product, size } : null
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)

  const selectedPoint = pickupPoints.find((point) => point.isSelected) ?? pickupPoints[0]
  const selectedPayment = paymentMethods.find((method) => method.selected) ?? paymentMethods[0]
  const total = rows.reduce((sum, row) => sum + row.item.unitPrice * row.item.quantity, 0)

  function updateQuantity(itemId: string, nextQuantity: number) {
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, quantity: nextQuantity } : item)))
  }

  function clearCart() {
    setItems([])
  }

  return (
    <section className={`${styles.screen} ${styles.cartScreen}`} aria-labelledby="cart-title">
      <header className={styles.cartHeader}>
        <Link className={styles.roundIconButton} to="/catalog" aria-label="Назад">
          ←
        </Link>
        <div className={styles.cartHeaderInfo}>
          <p className={styles.eyebrow}>📍 {selectedPoint?.title}</p>
          <p className={styles.muted}>будет готово через ⏱ {selectedPoint?.readyTimeLabel}</p>
        </div>
        <button
          className={styles.roundIconButton}
          type="button"
          onClick={clearCart}
          disabled={rows.length === 0}
          aria-label="Очистить корзину"
        >
          🗑
        </button>
      </header>

      <h1 className={styles.visuallyHidden} id="cart-title">
        Корзина
      </h1>

      <div className={styles.list}>
        {rows.map(({ item, product, size }) => (
          <article className={styles.cartCard} key={item.id}>
            <div className={styles.cartImageFrame}>
              <img className={styles.cartImage} src={product.imageSrc} alt={product.imageAlt} draggable={false} />
              {product.badge ? (
                <Badge className={styles.cartBadge} tone={product.badge.tone}>
                  {product.badge.label}
                </Badge>
              ) : null}
            </div>
            <div className={styles.cartBody}>
              <p className={styles.muted}>{size?.label}</p>
              <p className={styles.cardTitle}>{product.title}</p>
              <NutritionRow
                calories={product.nutrition.calories}
                carbs={product.nutrition.carbs}
                fats={product.nutrition.fats}
                proteins={product.nutrition.proteins}
              />
              <div className={styles.cartFooter}>
                <span className={styles.price}>{formatMoney(item.unitPrice * item.quantity)}</span>
                <Stepper
                  value={item.quantity}
                  min={1}
                  onDecrease={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
                />
              </div>
            </div>
          </article>
        ))}
      </div>

      <section className={styles.section} aria-labelledby="cross-sell-title">
        <h2 className={styles.sectionTitle} id="cross-sell-title">
          Вместе вкуснее
        </h2>
        <HScroll>
          <div className={styles.crossSellRail}>
            {crossSellItems.map((item) => (
              <CrossSellCard
                imageAlt={item.imageAlt}
                imageSrc={item.imageSrc}
                key={item.id}
                price={formatMoney(item.price)}
                title={item.title}
              />
            ))}
          </div>
        </HScroll>
      </section>

      <div className={styles.cartBottomBar}>
        <button className={styles.paymentSelector} type="button" aria-label="Выбрать способ оплаты">
          <span className={styles.paymentLogo}>{selectedPayment?.logoLabel}</span>
          <span aria-hidden="true">⌄</span>
        </button>
        <div className={styles.cartTotalRow}>
          <span className={styles.muted}>Итого</span>
          <span className={styles.price}>{formatMoney(total)}</span>
        </div>
        <button className={styles.payButton} type="button" disabled={rows.length === 0}>
          Оплатить с <span className={styles.paymentLogo}>{selectedPayment?.logoLabel}</span>
        </button>
      </div>
    </section>
  )
}
