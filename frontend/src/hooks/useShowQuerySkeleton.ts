import { useIsRestoring } from '@tanstack/react-query'

/**
 * Mostra lo skeleton solo al primo caricamento senza dati.
 * Evita flash su navigazione SPA, refetch in background e reidratazione IndexedDB.
 */
export function useShowQuerySkeleton(isLoading: boolean, hasData: boolean): boolean {
  const isRestoring = useIsRestoring()
  if (isRestoring) return false
  return isLoading && !hasData
}
