import type { OrderPosition, OrderPositionStatus } from '../../types'
import { EmptyState } from '../EmptyState'
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
  const isEmpty = positions.length === 0

  return (
    <section
      className={styles.grid}
      aria-label={`${statusFilter} order positions`}
      data-status-filter={statusFilter}
    >
      {isEmpty ? (
        <EmptyState
          className={styles.emptyState}
          title="Очередь пуста"
          description="Новые позиции появятся здесь автоматически."
        />
      ) : (
        positions.map((position) => (
          <PositionCard
            key={position.id}
            position={position}
            onPositionClick={onPositionClick}
          />
        ))
      )}
    </section>
  )
}
