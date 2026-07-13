import { Outlet } from 'react-router-dom'

import { classNames } from '../components/classNames'
import styles from './AppLayout.module.css'

export function AppLayout() {
  return (
    <main className={classNames('safe-area', styles.app)}>
      <div className={styles.shell}>
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </main>
  )
}
