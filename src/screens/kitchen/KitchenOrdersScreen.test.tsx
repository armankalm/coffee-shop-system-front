import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { OrderPosition, OrderPositionStatus } from '../../types'
import {
  InProgressOrdersScreen,
  NewOrdersScreen,
  ReadyOrdersScreen,
} from './index'
import {
  getKitchenOrdersGridProps,
  type KitchenBoardScreenStatus,
} from './kitchenOrdersGridProps'

const mockKitchenBoard = vi.hoisted(() => ({
  advancePosition: vi.fn(),
  positionsByStatus: vi.fn(),
}))

vi.mock('../../kitchen/KitchenBoardContext', () => ({
  useKitchenBoard: () => mockKitchenBoard,
}))

const positions: OrderPosition[] = [
  {
    id: 'pos-new',
    orderNumber: '#101',
    title: 'Cortado',
    status: 'NEW',
    createdAt: '2026-07-19T08:00:00.000Z',
  },
  {
    id: 'pos-progress',
    orderNumber: '#102',
    title: 'Pour over',
    status: 'IN_PROGRESS',
    createdAt: '2026-07-19T08:01:00.000Z',
  },
  {
    id: 'pos-ready',
    orderNumber: '#103',
    title: 'Matcha',
    status: 'READY',
    createdAt: '2026-07-19T08:02:00.000Z',
  },
]

function positionsByStatus(status: OrderPositionStatus) {
  return positions.filter((position) => position.status === status)
}

describe('kitchen order screens', () => {
  beforeEach(() => {
    mockKitchenBoard.advancePosition.mockReset()
    mockKitchenBoard.positionsByStatus.mockReset()
    mockKitchenBoard.positionsByStatus.mockImplementation(positionsByStatus)
  })

  const screenCases = [
    { Component: NewOrdersScreen, status: 'NEW', expectedTitle: 'Cortado' },
    { Component: InProgressOrdersScreen, status: 'IN_PROGRESS', expectedTitle: 'Pour over' },
    { Component: ReadyOrdersScreen, status: 'READY', expectedTitle: 'Matcha' },
  ] as const

  for (const screenCase of screenCases) {
    it(`renders ${screenCase.status} positions from KitchenBoardContext`, () => {
      const Screen = screenCase.Component
      const markup = renderToStaticMarkup(<Screen />)

      expect(mockKitchenBoard.positionsByStatus).toHaveBeenCalledWith(screenCase.status)
      expect(markup).toContain(`data-status-filter="${screenCase.status}"`)
      expect(markup).toContain(screenCase.expectedTitle)
    })
  }

  it('wires grid clicks to advancePosition', () => {
    const advancePosition = vi.fn()
    const statusFilter: KitchenBoardScreenStatus = 'NEW'
    const gridProps = getKitchenOrdersGridProps(statusFilter, {
      advancePosition,
      positionsByStatus,
    })

    gridProps.onPositionClick('pos-new')

    expect(gridProps.positions.map((position) => position.id)).toEqual(['pos-new'])
    expect(advancePosition).toHaveBeenCalledWith('pos-new')
  })
})

