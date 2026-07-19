// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { OrderPosition, OrderPositionStatus } from '../types'
import { cleanupDocument, clickElement, renderIntoDocument, waitFor } from '../testUtils/dom'

const mockPositionsApi = vi.hoisted(() => ({
  advancePositionStatus: vi.fn(),
  getPositions: vi.fn(),
  nextStatus: (status: OrderPositionStatus) => {
    const transitions: Record<OrderPositionStatus, OrderPositionStatus> = {
      NEW: 'IN_PROGRESS',
      IN_PROGRESS: 'READY',
      READY: 'COMPLETED',
      COMPLETED: 'COMPLETED',
    }
    return transitions[status]
  },
}))

vi.mock('../api/positions', () => mockPositionsApi)

import { KitchenBoardProvider, useKitchenBoard } from './KitchenBoardContext'

const initialPositions: OrderPosition[] = [
  {
    id: 'pos-new',
    orderNumber: '#101',
    title: 'Cortado',
    status: 'NEW',
    createdAt: '2026-07-19T08:00:00.000Z',
  },
]

function KitchenBoardProbe() {
  const { advancePosition, counts, error, loading, positions } = useKitchenBoard()
  const firstPosition = positions[0]

  return (
    <div>
      <output data-testid="snapshot">
        {positions.length}:{String(loading)}:{error ?? 'null'}:{counts.NEW}:{counts.IN_PROGRESS}:{firstPosition?.status ?? 'none'}
      </output>
      <button
        type="button"
        onClick={() => {
          void advancePosition('pos-new')
        }}
      >
        advance
      </button>
    </div>
  )
}

describe('KitchenBoardProvider async behavior', () => {
  beforeEach(() => {
    mockPositionsApi.advancePositionStatus.mockReset()
    mockPositionsApi.getPositions.mockReset()
  })

  afterEach(async () => {
    await cleanupDocument()
  })

  it('loads positions and exposes derived counts', async () => {
    mockPositionsApi.getPositions.mockResolvedValue(initialPositions)

    const { container } = await renderIntoDocument(
      <KitchenBoardProvider>
        <KitchenBoardProbe />
      </KitchenBoardProvider>,
    )

    await waitFor(() => {
      expect(container.textContent).toContain('1:false:null:1:0:NEW')
    })
  })

  it('stores load errors and stops loading', async () => {
    mockPositionsApi.getPositions.mockRejectedValue(new Error('load failed'))

    const { container } = await renderIntoDocument(
      <KitchenBoardProvider>
        <KitchenBoardProbe />
      </KitchenBoardProvider>,
    )

    await waitFor(() => {
      expect(container.textContent).toContain('0:false:load failed:0:0:none')
    })
  })

  it('rolls back an optimistic advance when the API rejects', async () => {
    mockPositionsApi.getPositions.mockResolvedValue(initialPositions)
    mockPositionsApi.advancePositionStatus.mockRejectedValue(new Error('advance failed'))

    const { container } = await renderIntoDocument(
      <KitchenBoardProvider>
        <KitchenBoardProbe />
      </KitchenBoardProvider>,
    )

    await waitFor(() => {
      expect(container.textContent).toContain('1:false:null:1:0:NEW')
    })

    const advanceButton = container.querySelector('button')
    expect(advanceButton).not.toBeNull()
    await clickElement(advanceButton!)

    await waitFor(() => {
      expect(container.textContent).toContain('1:false:advance failed:1:0:NEW')
    })
  })
})
