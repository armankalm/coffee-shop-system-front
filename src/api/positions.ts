import type { OrderPosition, OrderPositionStatus } from '../types'
import { apiGet, apiPatch } from './client'

/**
 * Kitchen-board order item as returned by the backend
 * (GET/PATCH /api/admin/order-items). One item = one board card,
 * advancing its status independently of its siblings in the same order.
 */
export type OrderItemBoardDto = {
  id: number
  orderId: number
  shopId: number
  orderNumber: string
  title: string
  quantity: number
  status: OrderPositionStatus
  statusNameRu: string
  createdAt: string
  comment?: string | null
}

const statusTransitions: Record<OrderPositionStatus, OrderPositionStatus> = {
  NEW: 'IN_PROGRESS',
  IN_PROGRESS: 'READY',
  READY: 'COMPLETED',
  COMPLETED: 'COMPLETED',
}

export function nextStatus(status: OrderPositionStatus) {
  return statusTransitions[status]
}

function toOrderPosition(dto: OrderItemBoardDto): OrderPosition {
  return {
    id: String(dto.id),
    orderNumber: dto.orderNumber,
    title: dto.quantity > 1 ? `${dto.title} ×${dto.quantity}` : dto.title,
    status: dto.status,
    createdAt: dto.createdAt,
    ...(dto.comment ? { comment: dto.comment } : {}),
  }
}

export async function getPositions(): Promise<OrderPosition[]> {
  const items = await apiGet<OrderItemBoardDto[]>('/admin/order-items')
  return items.map(toOrderPosition)
}

export async function advancePositionStatus(
  id: string,
  expectedStatus?: OrderPositionStatus,
): Promise<OrderPosition> {
  const targetStatus = expectedStatus ? nextStatus(expectedStatus) : undefined

  if (expectedStatus && targetStatus === expectedStatus) {
    // Already terminal (COMPLETED) — nothing to advance to.
    throw new Error(`Order position ${id} is already ${expectedStatus}`)
  }

  const updated = await apiPatch<OrderItemBoardDto>(`/admin/order-items/${id}/status`, {
    statusCode: targetStatus,
  })

  return toOrderPosition(updated)
}
