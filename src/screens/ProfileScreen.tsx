import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ApiError, resolveAssetUrl } from '../api/client'
import type { OrderDto } from '../api/orders'
import { getUserOrders } from '../api/orders'
import { getProductById } from '../api/products'
import type { UserDto } from '../api/user'
import { getCurrentUser } from '../api/user'
import { useAuth } from '../auth/AuthContext'
import { HScroll } from '../components'
import heroFallback from '../assets/hero.png'
import loginStyles from './LoginScreen.module.css'
import styles from './Screens.module.css'

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; user: UserDto; orders: OrderDto[]; productImages: Map<number, string | null> }

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

function formatMoney(amount: number) {
  return `${amount.toLocaleString('ru-RU')} ₸`
}

function formatOrderDate(value: string) {
  const date = new Date(value)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}.${month}.${date.getFullYear()}`
}

function initialsFromEmail(email: string) {
  return email.slice(0, 2).toUpperCase()
}

export function ProfileScreen() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [state, setState] = useState<LoadState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false

    Promise.all([getCurrentUser(), getUserOrders()])
      .then(async ([user, orders]) => {
        if (cancelled) return

        const productIds = Array.from(new Set(orders.flatMap((order) => order.items.map((item) => item.productId))))
        const productImages = new Map<number, string | null>()
        await Promise.all(
          productIds.map(async (productId) => {
            try {
              const product = await getProductById(productId)
              productImages.set(productId, product.imagePath)
            } catch {
              productImages.set(productId, null)
            }
          }),
        )

        if (!cancelled) setState({ status: 'ready', user, orders, productImages })
      })
      .catch((err) => {
        if (!cancelled) {
          setState({
            status: 'error',
            message: err instanceof ApiError ? err.message : 'Не удалось загрузить профиль.',
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

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

      {state.status === 'loading' ? <p className={styles.muted}>Загружаем профиль…</p> : null}
      {state.status === 'error' ? <p className={styles.muted}>{state.message}</p> : null}

      {state.status === 'ready' ? (
        <>
          <Link className={styles.profileCard} to="/profile/edit">
            <span className={styles.avatar}>{initialsFromEmail(state.user.email)}</span>
            <div className={styles.profileDetails}>
              <p className={styles.profileName}>{state.user.name ?? state.user.email}</p>
              <p className={styles.muted}>{state.user.phone ?? state.user.coffeeShopName ?? state.user.email}</p>
            </div>
            <span className={styles.profileArrow} aria-hidden="true">
              &gt;
            </span>
          </Link>

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

            {state.orders.length === 0 ? (
              <p className={styles.muted}>Заказов пока нет.</p>
            ) : (
              <div className={styles.list}>
                {state.orders.map((order) => (
                  <article className={styles.orderCard} key={order.id}>
                    <Link className={styles.orderInfo} to={`/order/${order.id}`}>
                      <p className={styles.price}>{formatMoney(order.total)}</p>
                      <p className={styles.orderMeta}>
                        {formatOrderDate(order.createdAt)} · {order.shopName} · {order.statusNameRu}
                      </p>
                      <div className={styles.orderThumbs} aria-label="Напитки в заказе">
                        {order.items.slice(0, 3).map((item) => (
                          <img
                            alt=""
                            className={styles.orderThumb}
                            key={item.id}
                            src={
                              resolveAssetUrl(state.productImages.get(item.productId) ?? undefined) ?? heroFallback
                            }
                          />
                        ))}
                      </div>
                    </Link>
                    <Link className={styles.repeatButton} to="/catalog" aria-label="Повторить заказ">
                      <span aria-hidden="true">↻</span>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}

      <button className={loginStyles.linkAction} onClick={handleLogout} type="button">
        Выйти из аккаунта
      </button>
    </section>
  )
}
