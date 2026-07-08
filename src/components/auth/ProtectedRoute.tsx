import { Navigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import type { Papel } from '@/types/database'

interface ProtectedRouteProps {
  children: React.ReactNode
  roles?: Papel[]
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { session, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Carregando…
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  if (roles && (!profile || !roles.includes(profile.papel))) {
    const fallback = profile?.papel === 'gestor' ? '/admin' : '/app'
    return <Navigate to={fallback} replace />
  }

  return <>{children}</>
}
