import { Link } from 'react-router-dom'

import { Button, ListItem } from '../components'
import { cityPoints, recentPoints } from '../mocks'
import styles from './Screens.module.css'

export function LocationsScreen() {
  return (
    <section className={styles.screen} aria-labelledby="locations-title">
      <header className={styles.header}>
        <p className={styles.eyebrow}>drinkit</p>
        <h1 className={styles.title} id="locations-title">
          Выбор адреса
        </h1>
      </header>

      <section className={styles.section} aria-labelledby="recent-points-title">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle} id="recent-points-title">
            Недавние
          </h2>
          <span className={styles.meta}>{recentPoints.length}</span>
        </div>
        <div className={styles.list}>
          {recentPoints.map((point) => (
            <ListItem
              address={point.address}
              key={point.id}
              marker={point.isSelected === true}
              time={`${point.readyTimeLabel} · ${point.distanceLabel}`}
              title={point.title}
            />
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="city-points-title">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle} id="city-points-title">
            Алматы
          </h2>
        </div>
        <div className={styles.dividerList}>
          {cityPoints.map((point) => (
            <ListItem
              address={point.address}
              key={point.id}
              time={`${point.readyTimeLabel} · ${point.distanceLabel}`}
              title={point.title}
            />
          ))}
        </div>
      </section>

      <div className={styles.actions}>
        <Button variant="fab">Рядом со мной</Button>
        <Link className={styles.linkButton} to="/catalog">
          Каталог
        </Link>
      </div>
    </section>
  )
}
