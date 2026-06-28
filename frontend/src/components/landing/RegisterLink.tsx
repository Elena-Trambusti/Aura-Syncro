import { Link, useNavigate } from 'react-router-dom'
import type { ComponentProps } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { isDemoUserEmail } from '../../lib/demoAccounts'

type RegisterLinkProps = Omit<ComponentProps<typeof Link>, 'to'>

/** Porta alla registrazione; se l'utente è in demo, esce prima dalla sessione demo. */
export default function RegisterLink({ onClick, ...props }: RegisterLinkProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <Link
      to="/register"
      {...props}
      onClick={e => {
        if (user && isDemoUserEmail(user.email)) {
          e.preventDefault()
          logout()
          navigate('/register')
        }
        onClick?.(e)
      }}
    />
  )
}
