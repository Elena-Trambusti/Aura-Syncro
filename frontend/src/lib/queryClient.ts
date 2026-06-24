import { QueryClient } from '@tanstack/react-query'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { get, set, del } from 'idb-keyval'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      gcTime: 1000 * 60 * 60 * 24, // 24 ore (prima era cacheTime)
      staleTime: 2 * 60_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      networkMode: 'offlineFirst', // CRITICO: Forza l'uso della cache se offline
    },
  },
})

// Adattatore idb-keyval per React Query Persister
const idbValidKey = (key: string) => `reactQuery-${key}`
export const idbPersister = createAsyncStoragePersister({
  storage: {
    getItem: async (key: string) => await get(idbValidKey(key)),
    setItem: async (key: string, value: any) => await set(idbValidKey(key), value),
    removeItem: async (key: string) => await del(idbValidKey(key)),
  },
})

/** Invalida tutte le query tenant-scoped al cambio ristorante o regime fiscale */
export function invalidateTenantQueries(tenantKey: string) {
  queryClient.invalidateQueries({ queryKey: [tenantKey] })
}
