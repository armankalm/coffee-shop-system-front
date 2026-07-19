import { orderPositions } from '../mocks'
import type { OrderPosition, OrderPositionStatus } from '../types'

const statusTransitions: Record<OrderPositionStatus, OrderPositionStatus> = {
  NEW: 'IN_PROGRESS',
  IN_PROGRESS: 'READY',
  READY: 'COMPLETED',
  COMPLETED: 'COMPLETED',
}

let positions = orderPositions.map(copyPosition)

function copyPosition(position: OrderPosition): OrderPosition {
  return { ...position }
}

export function nextStatus(status: OrderPositionStatus) {
  return statusTransitions[status]
}

export async function getPositions(): Promise<OrderPosition[]> {
  return positions.map(copyPosition)
}

export async function advancePositionStatus(
  id: string,
  expectedStatus?: OrderPositionStatus,
): Promise<OrderPosition> {
  const currentPosition = positions.find((position) => position.id === id)

  if (!currentPosition) {
    throw new Error(`Order position ${id} was not found`)
  }

  if (expectedStatus && currentPosition.status !== expectedStatus) {
    throw new Error(`Order position ${id} is ${currentPosition.status}, expected ${expectedStatus}`)
  }

  const updatedPosition: OrderPosition = {
    ...currentPosition,
    status: nextStatus(currentPosition.status),
  }

  positions = positions.map((position) => (position.id === id ? updatedPosition : position))

  return copyPosition(updatedPosition)
}
