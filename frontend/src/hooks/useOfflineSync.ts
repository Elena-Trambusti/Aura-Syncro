import { useCallback, useEffect, useState } from 'react'
import {
  countPendingMutations,
  listPendingMutations,
  type OfflineMutation,
} from '../lib/offlineQueue'
import {
  flushOfflineQueue,
  initOfflineSync,
  isFlushingQueue,
  subscribeOfflineSync,
} from '../lib/offlineSync'

export function useOfflineSync(enabled: boolean, onSynced?: () => void) {
  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isOnline, setIsOnline] = useState(
    () => typeof navigator === 'undefined' || navigator.onLine,
  )
  const [pendingItems, setPendingItems] = useState<OfflineMutation[]>([])

  const refresh = useCallback(async () => {
    const [count, items] = await Promise.all([countPendingMutations(), listPendingMutations()])
    setPendingCount(count)
    setPendingItems(items)
    setIsSyncing(isFlushingQueue())
    setIsOnline(typeof navigator === 'undefined' || navigator.onLine)
  }, [])

  useEffect(() => {
    if (!enabled) return

    void refresh()

    const unsubSync = subscribeOfflineSync(() => {
      void refresh()
    })

    const handleOnline = () => {
      setIsOnline(true)
      void refresh()
    }
    const handleOffline = () => {
      setIsOnline(false)
      void refresh()
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    const stopInit = initOfflineSync(() => {
      onSynced?.()
      void refresh()
    })

    return () => {
      unsubSync()
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      stopInit()
    }
  }, [enabled, onSynced, refresh])

  const retryNow = useCallback(async () => {
    setIsSyncing(true)
    try {
      await flushOfflineQueue()
    } finally {
      await refresh()
    }
  }, [refresh])

  return {
    pendingCount,
    pendingItems,
    isSyncing,
    isOnline,
    retryNow,
    refresh,
  }
}
