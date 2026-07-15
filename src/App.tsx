import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'
import Login from '@/pages/auth/Login'
import VendedoraLayout from '@/pages/vendedora/VendedoraLayout'
import VendedoraDashboard from '@/pages/vendedora/Dashboard'
import GestorLayout from '@/pages/gestor/GestorLayout'
import GestorOverview from '@/pages/gestor/Overview'
import GestorVendedoras from '@/pages/gestor/Vendedoras'
import GestorCatalogo from '@/pages/gestor/Catalogo'
import GestorMetas from '@/pages/gestor/Metas'
import GestorRegistros from '@/pages/gestor/Registros'
import GestorRelatorios from '@/pages/gestor/Relatorios'
import RankingPage from '@/pages/Ranking'

function IndexRedirect() {
  const { profile } = useAuth()
  const destino =
    profile?.papel === 'gestor'
      ? '/admin'
      : profile?.papel === 'visualizador'
        ? '/ranking'
        : '/app'
  return <Navigate to={destino} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <IndexRedirect />
          </ProtectedRoute>
        }
      />

      <Route
        path="/app"
        element={
          <ProtectedRoute roles={['vendedora', 'gestor']}>
            <AppShell>
              <VendedoraLayout />
            </AppShell>
          </ProtectedRoute>
        }
      >
        <Route index element={<VendedoraDashboard />} />
        <Route path="ranking" element={<RankingPage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['gestor']}>
            <AppShell>
              <GestorLayout />
            </AppShell>
          </ProtectedRoute>
        }
      >
        <Route index element={<GestorOverview />} />
        <Route path="registros" element={<GestorRegistros />} />
        <Route path="vendedoras" element={<GestorVendedoras />} />
        <Route path="catalogo" element={<GestorCatalogo />} />
        <Route path="metas" element={<GestorMetas />} />
        <Route path="ranking" element={<RankingPage />} />
        <Route path="relatorios" element={<GestorRelatorios />} />
      </Route>

      <Route
        path="/ranking"
        element={
          <ProtectedRoute roles={['visualizador']}>
            <AppShell>
              <RankingPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
