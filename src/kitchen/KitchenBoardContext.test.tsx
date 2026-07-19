import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { OrderPosition } from '../types'
import {
  advancePositionOptimistically,
  countPositionsByStatus,
  KitchenBoardProvider,
  selectPositionsByStatus,
  useKitchenBoard,
} from './KitchenBoardContext'

const testPositions: OrderPosition[] = [
  {
    id: 'ready-newer',
    orderNumber: '1003',
    title: 'Latte',
    status: 'READY',
    createdAt: '2026-07-19T09:10:00+05:00',
  },
  {
    id: 'new-position',
    orderNumber: '1001',
    title: 'Flat white',
    status: 'NEW',
    createdAt: '2026-07-19T09:05:00+05:00',
  },
  {
    id: 'ready-older',
    orderNumber: '1002',
    title: 'Americano',
    status: 'READY',
    createdAt: '2026-07-19T09:02:00+05:00',
  },
]

function KitchenBoardSnapshot() {
  const { positions, loading, error, counts, positionsByStatus } = useKitchenBoard()

  return (
    <output>
      {positions.length}:{String(loading)}:{String(error)}:{counts.NEW}:{positionsByStatus('NEW').length}
    </output>
  )
}

function ConsumerWithoutProvider() {
  useKitchenBoard()
  return null
}

describe('KitchenBoardContext', () => {
  it('filters positions by status and sorts them FIFO', () => {
    const readyPositions = selectPositionsByStatus(testPositions, 'READY')

    expect(readyPositions.map((position) => position.id)).toEqual(['ready-older', 'ready-newer'])
  })

  it('counts positions for every kitchen-board status', () => {
    expect(countPositionsByStatus(testPositions)).toEqual({
      NEW: 1,
      IN_PROGRESS: 0,
      READY: 2,
      COMPLETED: 0,
    })
  })

  it('applies the optimistic local status transition', () => {
    const advancedPositions = advancePositionOptimistically(testPositions, 'new-position')

    expect(advancedPositions.find((position) => position.id === 'new-position')?.status).toBe('IN_PROGRESS')
    expect(advancedPositions.find((position) => position.id === 'ready-newer')?.status).toBe('READY')
  })

  it('provides initial loading state before client-side loading resolves', () => {
    const markup = renderToStaticMarkup(
      <KitchenBoardProvider>
        <KitchenBoardSnapshot />
      </KitchenBoardProvider>,
    )

    expect(markup).toContain('0:true:null:0:0')
  })

  it('requires consumers to be rendered inside KitchenBoardProvider', () => {
    expect(() => renderToStaticMarkup(<ConsumerWithoutProvider />)).toThrow(
      'useKitchenBoard must be used within a KitchenBoardProvider',
    )
  })
})
