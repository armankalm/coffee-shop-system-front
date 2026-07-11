import { Link } from 'react-router-dom'

import { CrossSellCard, HScroll, Stepper } from '../components'
import { cartItems, crossSellItems, formatMoney, paymentMethods, pickupPoints, products } from '../mocks'
import styles from './Screens.module.css'

export function CartScreen() {
  const rows = cartItems
    .map((item) => {
      const product = products.find((entry) => entry.id === item.productId)

      return product ? { item, product } : null
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)

  const selectedPoint = pickupPoints.find((point) => point.isSelected) ?? pickupPoints[0]
  const selectedPayment = paymentMethods.find((method) => method.selected) ?? paymentMethods[0]
  const total = rows.reduce((sum, row) => sum + row.item.unitPrice * row.item.quantity, 0)

  return (
    <section className={styles.screen} aria-labelledby="cart-title">
      <header className={styles.header}>
        <p className={styles.eyebrow}>{selectedPoint?.title}</p>
        <h1 className={styles.title} id="cart-title">
          Корзина
        </h1>
        <p className={styles.muted}>{selectedPoint?.readyTimeLabel}</p>
      </header>

      <div className={styles.list}>
        {rows.map(({ item, product }) => (
          <article className={styles.cartCard} key={item.id}>
            <img className={styles.cartImage} src={product.imageSrc} alt={product.imageAlt} draggable={false} />
            <div className={styles.cartBody}>
              <p className={styles.cardTitle}>{product.title}</p>
              <div className={styles.cartFooter}>
                <span className={styles.price}>{formatMoney(item.unitPrice)}</span>
                <Stepper value={item.quantity} min={1} />
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

      <article className={styles.summaryCard}>
        <p className={styles.muted}>{selectedPayment?.title}</p>
        <p className={styles.price}>Итого {formatMoney(total)}</p>
        <div className={styles.actions}>
          <Link className={styles.ghostButton} to="/locations">
            Адрес
          </Link>
          <Link className={styles.linkButton} to="/catalog">
            Добавить еще
          </Link>
        </div>
      </article>
    </section>
  )
}
