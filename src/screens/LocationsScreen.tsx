import { useNavigate } from 'react-router-dom'

import { Button, ListItem } from '../components'
import { cityPoints, recentPoints } from '../mocks'
import styles from './Screens.module.css'

export function LocationsScreen() {
  const navigate = useNavigate()
  const goToCatalog = () => navigate('/catalog')

  return (
    <section className={`${styles.screen} ${styles.locationScreen}`} aria-labelledby="locations-title">
      <h1 className={styles.visuallyHidden} id="locations-title">
        Выбор места заказа
      </h1>

      <header className={styles.locationTopBar} aria-label="Поиск точки заказа">
        <div className={styles.searchField}>
          <span className={styles.searchIcon} aria-hidden="true">
            ⌕
          </span>
          <input className={styles.searchInput} type="search" placeholder="Поиск" aria-label="Поиск" />
          <button className={styles.mapButton} type="button" aria-label="Открыть карту">
            <span aria-hidden="true">⌖</span>
          </button>
        </div>
        <button
          className={styles.closeButton}
          type="button"
          aria-label="Закрыть выбор адреса"
          onClick={goToCatalog}
        >
          ×
        </button>
      </header>

      <section className={styles.section} aria-labelledby="recent-points-title">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle} id="recent-points-title">
            Недавние
          </h2>
        </div>
        <div className={styles.locationList}>
          {recentPoints.map((point) => (
            <ListItem
              address={point.address}
              key={point.id}
              marker={point.isSelected === true}
              markerLabel="Выбранная точка"
              onClick={goToCatalog}
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
              onClick={goToCatalog}
              time={`${point.readyTimeLabel} · ${point.distanceLabel}`}
              title={point.title}
            />
          ))}
        </div>
      </section>

      <div className={styles.locationFabDock}>
        <Button
          className={styles.nearbyFab}
          variant="fab"
          aria-label="Найти ближайшую точку"
          onClick={goToCatalog}
        >
          <span aria-hidden="true">⌖</span>
          <span>Рядом со мной</span>
          <span className={styles.fabArrow} aria-hidden="true">
            →
          </span>
        </Button>
      </div>
    </section>
  )
}
