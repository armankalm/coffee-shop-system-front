import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import { advancePositionStatus, getPositions, nextStatus } from '../api/positions'
import type { OrderPosition, OrderPositionStatus } from '../types'

export type PositionCounts = Record<OrderPositionStatus, number>

type KitchenBoardContextValue = {
  positions: OrderPosition[]
  loading: boolean
  error: string | null
  actionError: string | null
  pendingPositionIds: readonly string[]
  advancePosition: (id: string, expectedStatus?: OrderPositionStatus) => Promise<void>
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
  const positionsRef = useRef<OrderPosition[]>([])
  const pendingPositionIdsRef = useRef<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [pendingPositionIds, setPendingPositionIds] = useState<string[]>([])

  const updatePositions = useCallback((nextPositions: OrderPosition[]) => {
    positionsRef.current = nextPositions
    setPositions(nextPositions)
  }, [])

  const setPositionPending = useCallback((id: string, pending: boolean) => {
    const nextPendingPositionIds = new Set(pendingPositionIdsRef.current)

    if (pending) {
      nextPendingPositionIds.add(id)
    } else {
      nextPendingPositionIds.delete(id)
    }

    pendingPositionIdsRef.current = nextPendingPositionIds
    setPendingPositionIds([...nextPendingPositionIds])
  }, [])

  useEffect(() => {
    let cancelled = false

    getPositions()
      .then((nextPositions) => {
        if (!cancelled) updatePositions(nextPositions)
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
  }, [updatePositions])

  const advancePosition = useCallback(
    async (id: string, expectedStatus?: OrderPositionStatus) => {
      if (pendingPositionIdsRef.current.has(id)) {
        return
      }

      const previousPosition = positionsRef.current.find((position) => position.id === id)

      if (!previousPosition) {
        return
      }

      if (expectedStatus && previousPosition.status !== expectedStatus) {
        return
      }

      setPositionPending(id, true)
      setActionError(null)
      updatePositions(advancePositionOptimistically(positionsRef.current, id))

      try {
        const updatedPosition = await advancePositionStatus(id, previousPosition.status)
        updatePositions(
          positionsRef.current.map((position) => (position.id === id ? updatedPosition : position)),
        )
      } catch (advanceError) {
        updatePositions(
          positionsRef.current.map((position) => (position.id === id ? previousPosition : position)),
        )
        setActionError(getErrorMessage(advanceError))
      } finally {
        setPositionPending(id, false)
      }
    },
    [setPositionPending, updatePositions],
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
      actionError,
      pendingPositionIds,
      advancePosition,
      positionsByStatus,
      counts,
    }),
    [positions, loading, error, actionError, pendingPositionIds, advancePosition, positionsByStatus, counts],
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
