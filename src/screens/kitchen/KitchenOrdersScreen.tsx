import { OrderPositionsGrid } from '../../components'
import { useKitchenBoard } from '../../kitchen/KitchenBoardContext'
import { getKitchenOrdersGridProps, type KitchenBoardScreenStatus } from './kitchenOrdersGridProps'

type KitchenOrdersScreenProps = {
  statusFilter: KitchenBoardScreenStatus
}

export function KitchenOrdersScreen({ statusFilter }: KitchenOrdersScreenProps) {
  const { advancePosition, positionsByStatus } = useKitchenBoard()
  const gridProps = getKitchenOrdersGridProps(statusFilter, { advancePosition, positionsByStatus })

  return <OrderPositionsGrid {...gridProps} />
}
