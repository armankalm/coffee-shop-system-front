import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { OrderPosition } from '../types'

type PositionsApi = typeof import('./positions')

let positionsApi: PositionsApi
let orderPositions: OrderPosition[]

describe('positions api', () => {
  beforeEach(async () => {
    vi.resetModules()
    positionsApi = await import('./positions')
    orderPositions = (await import('../mocks')).orderPositions
  })

  it('maps position statuses to the next kitchen-board step', () => {
    expect(positionsApi.nextStatus('NEW')).toBe('IN_PROGRESS')
    expect(positionsApi.nextStatus('IN_PROGRESS')).toBe('READY')
    expect(positionsApi.nextStatus('READY')).toBe('COMPLETED')
    expect(positionsApi.nextStatus('COMPLETED')).toBe('COMPLETED')
  })

  it('loads copied mock positions', async () => {
    const positions = await positionsApi.getPositions()

    expect(positions).toHaveLength(orderPositions.length)
    expect(orderPositions.length).toBeGreaterThanOrEqual(8)
    expect(orderPositions.length).toBeLessThanOrEqual(12)
    expect(orderPositions.some((position) => position.comment)).toBe(true)
    expect(positions[0]).toEqual(orderPositions[0])
    expect(positions[0]).not.toBe(orderPositions[0])
  })

  it('advances a position and persists the updated status', async () => {
    const newPosition = orderPositions.find((position) => position.status === 'NEW')

    if (!newPosition) {
      throw new Error('Expected at least one NEW mock position')
    }

    const inProgressPosition = await positionsApi.advancePositionStatus(newPosition.id, 'NEW')
    const readyPosition = await positionsApi.advancePositionStatus(newPosition.id, 'IN_PROGRESS')
    const completedPosition = await positionsApi.advancePositionStatus(newPosition.id, 'READY')
    const repeatedCompletedPosition = await positionsApi.advancePositionStatus(newPosition.id, 'COMPLETED')
    const positions = await positionsApi.getPositions()
    const persistedPosition = positions.find((position) => position.id === newPosition.id)

    expect(inProgressPosition.status).toBe('IN_PROGRESS')
    expect(readyPosition.status).toBe('READY')
    expect(completedPosition.status).toBe('COMPLETED')
    expect(repeatedCompletedPosition.status).toBe('COMPLETED')
    expect(persistedPosition?.status).toBe('COMPLETED')
  })

  it('rejects unknown position ids', async () => {
    await expect(positionsApi.advancePositionStatus('missing-position')).rejects.toThrow('missing-position')
  })

  it('rejects stale expected statuses', async () => {
    const newPosition = orderPositions.find((position) => position.status === 'NEW')

    if (!newPosition) {
      throw new Error('Expected at least one NEW mock position')
    }

    await positionsApi.advancePositionStatus(newPosition.id, 'NEW')

    await expect(positionsApi.advancePositionStatus(newPosition.id, 'NEW')).rejects.toThrow('expected NEW')
  })
})
