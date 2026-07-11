import { NavLink, Outlet } from 'react-router-dom'

import { classNames } from '../components/classNames'
import { featuredProduct } from '../mocks'
import styles from './AppLayout.module.css'

const navItems = [
  { to: '/locations', label: 'Адрес' },
  { to: '/profile', label: 'Профиль' },
  { to: '/catalog', label: 'Каталог' },
  { to: `/product/${featuredProduct.id}`, label: 'Напиток' },
  { to: '/cart', label: 'Корзина' },
]

type NavState = {
  isActive: boolean
}

export function AppLayout() {
  return (
    <main className={classNames('safe-area', styles.app)}>
      <div className={styles.shell}>
        <div className={styles.content}>
          <Outlet />
        </div>
        <nav className={styles.nav} aria-label="Основные экраны">
          {navItems.map((item) => (
            <NavLink
              className={({ isActive }: NavState) => classNames(styles.navLink, isActive && styles.activeNavLink)}
              key={item.to}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </main>
  )
}
