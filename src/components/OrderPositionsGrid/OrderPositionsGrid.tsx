import type { OrderPosition, OrderPositionStatus } from '../../types'
import { PositionCard } from '../PositionCard'
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
        <PositionCard
          key={position.id}
          position={position}
          onPositionClick={onPositionClick}
        />
      ))}
    </section>
  )
}
