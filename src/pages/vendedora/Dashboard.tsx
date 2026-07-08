import { useMemo } from 'react'
import { useAuth } from '@/lib/auth'
import { useAcoesCatalogo } from '@/hooks/useAcoesCatalogo'
import { useMeusRegistros } from '@/hooks/useRegistros'
import { StatusBadge } from '@/components/registros/StatusBadge'
import { ResumoMensal } from '@/components/vendedora/ResumoMensal'
import { VendedoraDoMes } from '@/components/gamification/VendedoraDoMes'
import { Badges } from '@/components/gamification/Badges'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export default function VendedoraDashboard() {
  const { profile } = useAuth()
  const { acoes } = useAcoesCatalogo()
  const { registros, loading } = useMeusRegistros(profile?.vendedora_id)

  const acaoPorId = useMemo(() => new Map(acoes.map((a) => [a.id, a])), [acoes])

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-semibold">Olá, {profile?.nome ?? 'vendedora'}</h1>

      <VendedoraDoMes />
      <ResumoMensal vendedoraId={profile?.vendedora_id} />

      <h2 className="mb-2 text-sm font-medium text-muted-foreground">Conquistas</h2>
      <div className="mb-4">
        <Badges vendedoraId={profile?.vendedora_id} />
      </div>

      <h2 className="mb-2 text-sm font-medium text-muted-foreground">Meus pontos vieram de</h2>

      {loading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {registros.map((registro) => {
            const acao = acaoPorId.get(registro.acao_id)
            return (
              <Card key={registro.id}>
                <CardContent className="flex items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="font-medium">{acao?.descricao ?? 'Ação'}</p>
                    <p className="text-sm text-muted-foreground">
                      {registro.quantidade}x ·{' '}
                      {new Date(registro.data_ocorrencia + 'T00:00:00').toLocaleDateString(
                        'pt-BR',
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-semibold text-brand-600 dark:text-brand-400">
                      {registro.pontos_calculados} pts
                    </span>
                    <StatusBadge status={registro.status} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
          {registros.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum ponto lançado ainda. Assim que o gestor registrar suas ações, elas aparecem
              aqui.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
