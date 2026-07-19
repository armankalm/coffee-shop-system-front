import type { OrderPosition, OrderPositionStatus } from '../../types'
import styles from './OrderPositionsGrid.module.css'

export type OrderPositionsGridProps = {
  statusFilter: OrderPositionStatus
  positions: OrderPosition[]
  onPositionClick: (id: string) => void
}

export function OrderPositionsGrid({
  statusFilter,
  positions,
  onPositionClick,
}: OrderPositionsGridProps) {
  return (
    <section
      className={styles.grid}
      aria-label={`${statusFilter} order positions`}
      data-status-filter={statusFilter}
    >
      {positions.map((position) => (
        <button
          className={styles.item}
          data-position-id={position.id}
          data-status={position.status}
          key={position.id}
          onClick={() => onPositionClick(position.id)}
          type="button"
        >
          <span className={styles.title}>{position.title}</span>
          <span className={styles.meta}>
            <span>{position.orderNumber}</span>
            <span>{position.status}</span>
          </span>
        </button>
      ))}
    </section>
  )
}
