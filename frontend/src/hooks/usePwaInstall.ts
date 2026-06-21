import { useCallback, useEffect, useRef, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches
    || (window.navigator as Navigator & { standalone?: boolean }).standalone === true
}

export function usePwaInstall() {
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null)
  const [canInstall, setCanInstall] = useState(false)
  const [isStandalone, setIsStandalone] = useState(isStandaloneMode)

  useEffect(() => {
    setIsStandalone(isStandaloneMode())

    const onBeforeInstall = (event: Event) => {
      event.preventDefault()
      deferredRef.current = event as BeforeInstallPromptEvent
      setCanInstall(true)
    }

    const onDisplayMode = () => setIsStandalone(isStandaloneMode())

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.matchMedia('(display-mode: standalone)').addEventListener('change', onDisplayMode)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', onDisplayMode)
    }
  }, [])

  const install = useCallback(async (): Promise<boolean> => {
    const prompt = deferredRef.current
    if (!prompt) return false
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    deferredRef.current = null
    setCanInstall(false)
    if (outcome === 'accepted') setIsStandalone(true)
    return outcome === 'accepted'
  }, [])

  return { canInstall, isStandalone, install }
}
