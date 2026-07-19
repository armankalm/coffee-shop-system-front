import type { OrderPositionsGridProps } from '../../components'
import type { OrderPosition, OrderPositionStatus } from '../../types'

export type KitchenBoardScreenStatus = Extract<OrderPositionStatus, 'NEW' | 'IN_PROGRESS' | 'READY'>

type KitchenOrdersGridDependencies = {
  advancePosition: (id: string) => Promise<void> | void
  positionsByStatus: (status: KitchenBoardScreenStatus) => OrderPosition[]
}

export function getKitchenOrdersGridProps(
  statusFilter: KitchenBoardScreenStatus,
  { advancePosition, positionsByStatus }: KitchenOrdersGridDependencies,
): OrderPositionsGridProps {
  return {
    statusFilter,
    positions: positionsByStatus(statusFilter),
    onPositionClick: (id) => {
      void advancePosition(id)
    },
  }
}

