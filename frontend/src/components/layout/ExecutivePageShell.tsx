import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface ExecutivePageShellProps {
  children: ReactNode
  className?: string
}

/** Wrapper pagina dashboard — spacing, mobile-first (senza animazione entrata per evitare flash) */
export default function ExecutivePageShell({ children, className }: ExecutivePageShellProps) {
  return (
    <div className={cn('pwa-mobile-page', className)}>
      {children}
    </div>
  )
}
