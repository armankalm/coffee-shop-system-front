import { EmptyState, OrderPositionsGrid } from '../../components'
import { useKitchenBoard } from '../../kitchen/KitchenBoardContext'
import type { OrderPositionStatus } from '../../types'

export type KitchenBoardScreenStatus = Extract<OrderPositionStatus, 'NEW' | 'IN_PROGRESS' | 'READY'>

type KitchenOrdersScreenProps = {
  statusFilter: KitchenBoardScreenStatus
}

export function KitchenOrdersScreen({ statusFilter }: KitchenOrdersScreenProps) {
  const { advancePosition, error, loading, positionsByStatus } = useKitchenBoard()

  if (loading) {
    return (
      <section aria-label={`${statusFilter} order positions`} data-status-filter={statusFilter}>
        <EmptyState title="Loading orders" description="Kitchen positions are loading." />
      </section>
    )
  }

  if (error) {
    return (
      <section aria-label={`${statusFilter} order positions`} data-status-filter={statusFilter}>
        <EmptyState role="alert" title="Unable to load orders" description={error} />
      </section>
    )
  }

  return (
    <OrderPositionsGrid
      statusFilter={statusFilter}
      positions={positionsByStatus(statusFilter)}
      onPositionClick={(id) => {
        void advancePosition(id)
      }}
    />
  )
}
