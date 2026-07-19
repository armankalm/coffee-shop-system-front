import { describe, expect, it } from 'vitest'

import { orderPositions } from '../mocks'
import { advancePositionStatus, getPositions, nextStatus } from './positions'

describe('positions api', () => {
  it('maps position statuses to the next kitchen-board step', () => {
    expect(nextStatus('NEW')).toBe('IN_PROGRESS')
    expect(nextStatus('IN_PROGRESS')).toBe('READY')
    expect(nextStatus('READY')).toBe('COMPLETED')
    expect(nextStatus('COMPLETED')).toBe('COMPLETED')
  })

  it('loads copied mock positions', async () => {
    const positions = await getPositions()

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

    const inProgressPosition = await advancePositionStatus(newPosition.id)
    const readyPosition = await advancePositionStatus(newPosition.id)
    const completedPosition = await advancePositionStatus(newPosition.id)
    const repeatedCompletedPosition = await advancePositionStatus(newPosition.id)
    const positions = await getPositions()
    const persistedPosition = positions.find((position) => position.id === newPosition.id)

    expect(inProgressPosition.status).toBe('IN_PROGRESS')
    expect(readyPosition.status).toBe('READY')
    expect(completedPosition.status).toBe('COMPLETED')
    expect(repeatedCompletedPosition.status).toBe('COMPLETED')
    expect(persistedPosition?.status).toBe('COMPLETED')
  })

  it('rejects unknown position ids', async () => {
    await expect(advancePositionStatus('missing-position')).rejects.toThrow('missing-position')
  })
})
