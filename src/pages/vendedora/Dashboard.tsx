import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth'
import { useAcoesCatalogo } from '@/hooks/useAcoesCatalogo'
import { useMeusRegistros } from '@/hooks/useRegistros'
import { RegistroFormDialog } from '@/components/registros/RegistroFormDialog'
import { StatusBadge } from '@/components/registros/StatusBadge'
import { ResumoMensal } from '@/components/vendedora/ResumoMensal'
import { VendedoraDoMes } from '@/components/gamification/VendedoraDoMes'
import { Badges } from '@/components/gamification/Badges'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export default function VendedoraDashboard() {
  const { profile } = useAuth()
  const { acoes } = useAcoesCatalogo()
  const { registros, loading, createRegistro } = useMeusRegistros(profile?.vendedora_id)
  const [dialogOpen, setDialogOpen] = useState(false)

  const acoesAtivas = useMemo(() => acoes.filter((a) => a.ativo), [acoes])
  const acaoPorId = useMemo(() => new Map(acoes.map((a) => [a.id, a])), [acoes])

  async function handleSubmit(input: Parameters<typeof createRegistro>[0]) {
    const result = await createRegistro(input)
    if (!result.error) toast.success('Ação registrada! Aguardando validação do gestor.')
    return result
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Olá, {profile?.nome ?? 'vendedora'}</h1>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" />
          Registrar
        </Button>
      </div>

      <VendedoraDoMes />
      <ResumoMensal vendedoraId={profile?.vendedora_id} />

      <h2 className="mb-2 text-sm font-medium text-muted-foreground">Conquistas</h2>
      <div className="mb-4">
        <Badges vendedoraId={profile?.vendedora_id} />
      </div>

      <h2 className="mb-2 text-sm font-medium text-muted-foreground">Meus registros</h2>

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
              Nenhum registro ainda. Toque em "Registrar" para lançar sua primeira ação.
            </p>
          )}
        </div>
      )}

      <RegistroFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        acoes={acoesAtivas}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
