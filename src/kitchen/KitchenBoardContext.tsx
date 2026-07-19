import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { advancePositionStatus, getPositions, nextStatus } from '../api/positions'
import type { OrderPosition, OrderPositionStatus } from '../types'

export type PositionCounts = Record<OrderPositionStatus, number>

type KitchenBoardContextValue = {
  positions: OrderPosition[]
  loading: boolean
  error: string | null
  advancePosition: (id: string) => Promise<void>
  positionsByStatus: (status: OrderPositionStatus) => OrderPosition[]
  counts: PositionCounts
}

const KitchenBoardContext = createContext<KitchenBoardContextValue | null>(null)

export function selectPositionsByStatus(positions: OrderPosition[], status: OrderPositionStatus) {
  return positions
    .filter((position) => position.status === status)
    .sort((first, second) => Date.parse(first.createdAt) - Date.parse(second.createdAt))
}

export function countPositionsByStatus(positions: OrderPosition[]): PositionCounts {
  return positions.reduce<PositionCounts>(
    (counts, position) => ({
      ...counts,
      [position.status]: counts[position.status] + 1,
    }),
    {
      NEW: 0,
      IN_PROGRESS: 0,
      READY: 0,
      COMPLETED: 0,
    },
  )
}

export function advancePositionOptimistically(positions: OrderPosition[], id: string) {
  return positions.map((position) =>
    position.id === id ? { ...position, status: nextStatus(position.status) } : position,
  )
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Failed to update order position'
}

export function KitchenBoardProvider({ children }: { children: ReactNode }) {
  const [positions, setPositions] = useState<OrderPosition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    getPositions()
      .then((nextPositions) => {
        if (!cancelled) setPositions(nextPositions)
      })
      .catch((loadError) => {
        if (!cancelled) setError(getErrorMessage(loadError))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const advancePosition = useCallback(
    async (id: string) => {
      const previousPosition = positions.find((position) => position.id === id)

      if (!previousPosition) {
        return
      }

      setError(null)
      setPositions((currentPositions) => advancePositionOptimistically(currentPositions, id))

      try {
        const updatedPosition = await advancePositionStatus(id)
        setPositions((currentPositions) =>
          currentPositions.map((position) => (position.id === id ? updatedPosition : position)),
        )
      } catch (advanceError) {
        setPositions((currentPositions) =>
          currentPositions.map((position) => (position.id === id ? previousPosition : position)),
        )
        setError(getErrorMessage(advanceError))
      }
    },
    [positions],
  )

  const counts = useMemo(() => countPositionsByStatus(positions), [positions])

  const positionsByStatus = useCallback(
    (status: OrderPositionStatus) => selectPositionsByStatus(positions, status),
    [positions],
  )

  const value = useMemo<KitchenBoardContextValue>(
    () => ({
      positions,
      loading,
      error,
      advancePosition,
      positionsByStatus,
      counts,
    }),
    [positions, loading, error, advancePosition, positionsByStatus, counts],
  )

  return <KitchenBoardContext.Provider value={value}>{children}</KitchenBoardContext.Provider>
}

export function useKitchenBoard() {
  const context = useContext(KitchenBoardContext)
  if (!context) {
    throw new Error('useKitchenBoard must be used within a KitchenBoardProvider')
  }
  return context
}
