import { Link } from 'react-router-dom'

import { HScroll } from '../components'
import { formatMoney, orderHistory, pickupPoints, userProfile } from '../mocks'
import styles from './Screens.module.css'

const profileStories = [
  {
    id: 'morning',
    title: 'Утренний сет',
    subtitle: 'Кофе + завтрак',
    tone: styles.storyBlue,
  },
  {
    id: 'bonus',
    title: 'Бонусы недели',
    subtitle: '+15% на протеин',
    tone: styles.storyOrange,
  },
  {
    id: 'favorite',
    title: 'Любимые напитки',
    subtitle: 'Быстрый повтор',
    tone: styles.storyGreen,
  },
]

function formatOrderDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split('-')

  return `${day}.${month}.${year}`
}

export function ProfileScreen() {
  return (
    <section className={`${styles.screen} ${styles.profileScreen}`} aria-labelledby="profile-title">
      <header className={styles.profileHeader}>
        <Link className={styles.roundIconButton} to="/locations" aria-label="Назад">
          <span aria-hidden="true">‹</span>
        </Link>
        <h1 className={styles.title} id="profile-title">
          Профиль
        </h1>
        <button className={styles.roundIconButton} type="button" aria-label="Открыть чат">
          <span aria-hidden="true">?</span>
        </button>
      </header>

      <article className={styles.profileCard}>
        <span className={styles.avatar}>{userProfile.avatarInitials}</span>
        <div className={styles.profileDetails}>
          <p className={styles.profileName}>{userProfile.name}</p>
          <p className={styles.muted}>{userProfile.phone}</p>
        </div>
        <span className={styles.profileArrow} aria-hidden="true">
          &gt;
        </span>
      </article>

      <HScroll aria-label="Баннеры профиля">
        <div className={styles.stories}>
          {profileStories.map((story) => (
            <article className={`${styles.story} ${story.tone}`} key={story.id}>
              <span className={styles.storyTitle}>{story.title}</span>
              <span className={styles.storySubtitle}>{story.subtitle}</span>
            </article>
          ))}
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
                <div className={styles.orderInfo}>
                  <p className={styles.price}>{formatMoney(order.total)}</p>
                  <p className={styles.orderMeta}>
                    {formatOrderDate(order.createdAt)} · {point?.title ?? 'drinkit'}
                  </p>
                  <div className={styles.orderThumbs} aria-label="Напитки в заказе">
                    {order.items.slice(0, 3).map((item) => (
                      <img
                        alt=""
                        className={styles.orderThumb}
                        key={`${order.id}-${item.productId}`}
                        src={item.imageSrc}
                      />
                    ))}
                  </div>
                </div>
                <Link className={styles.repeatButton} to="/cart" aria-label="Повторить заказ">
                  <span aria-hidden="true">↻</span>
                </Link>
              </article>
            )
          })}
        </div>
      </section>
    </section>
  )
}
