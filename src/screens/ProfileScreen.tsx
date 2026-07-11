import { Link } from 'react-router-dom'

import { HScroll } from '../components'
import { formatMoney, orderHistory, pickupPoints, userProfile } from '../mocks'
import styles from './Screens.module.css'

export function ProfileScreen() {
  return (
    <section className={styles.screen} aria-labelledby="profile-title">
      <header className={styles.header}>
        <p className={styles.eyebrow}>Аккаунт</p>
        <h1 className={styles.title} id="profile-title">
          Профиль
        </h1>
      </header>

      <article className={styles.profileCard}>
        <span className={styles.avatar}>{userProfile.avatarInitials}</span>
        <div>
          <p className={styles.profileName}>{userProfile.name}</p>
          <p className={styles.muted}>{userProfile.phone}</p>
        </div>
        <span className={styles.meta}>{userProfile.loyaltyLevel}</span>
      </article>

      <HScroll aria-label="Баннеры профиля">
        <div className={styles.stories}>
          <span className={styles.story}>Утренний сет</span>
          <span className={styles.story}>Бонусы недели</span>
          <span className={styles.story}>Любимые напитки</span>
        </div>
      </HScroll>

      <section className={styles.section} aria-labelledby="orders-title">
        <h2 className={styles.sectionTitle} id="orders-title">
          История заказов
        </h2>
        <div className={styles.list}>
          {orderHistory.map((order) => {
            const point = pickupPoints.find((item) => item.id === order.pointId)

            return (
              <article className={styles.orderCard} key={order.id}>
                <div>
                  <p className={styles.price}>{formatMoney(order.total)}</p>
                  <p className={styles.muted}>{point?.title ?? 'drinkit'}</p>
                </div>
                <Link className={styles.ghostButton} to="/cart">
                  Повторить
                </Link>
              </article>
            )
          })}
        </div>
      </section>
    </section>
  )
}
