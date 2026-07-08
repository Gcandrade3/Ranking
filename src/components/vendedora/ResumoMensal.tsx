import { Target, Trophy } from 'lucide-react'
import { useRanking } from '@/hooks/useRanking'
import { useMinhaMeta } from '@/hooks/useMinhaMeta'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { NivelBadge } from '@/components/gamification/NivelBadge'

export function ResumoMensal({ vendedoraId }: { vendedoraId: string | null | undefined }) {
  const now = new Date()
  const ano = now.getFullYear()
  const mes = now.getMonth() + 1
  const { mensal, anual, loading: loadingRanking } = useRanking(ano, mes)
  const { meta, bateu, loading: loadingMeta } = useMinhaMeta(vendedoraId, ano, mes)

  const posicao = mensal.findIndex((l) => l.vendedora_id === vendedoraId) + 1
  const minhaLinha = mensal.find((l) => l.vendedora_id === vendedoraId)
  const minhaLinhaAnual = anual.find((l) => l.vendedora_id === vendedoraId)

  if (loadingRanking || loadingMeta) return null

  return (
    <div className="mb-4 flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="flex flex-col gap-1 px-4 py-3">
            <Trophy className="size-5 text-brand-600 dark:text-brand-400" />
            <span className="text-2xl font-semibold">{minhaLinha?.pontos_total ?? 0} pts</span>
            <span className="text-xs text-muted-foreground">
              {posicao > 0 ? `${posicao}º lugar este mês` : 'Ainda sem pontos este mês'}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-1 px-4 py-3">
            <Target className="size-5 text-brand-600 dark:text-brand-400" />
            <span className="text-sm font-medium">
              {meta?.descricao_meta ?? 'Sem meta definida'}
            </span>
            {meta && (
              <Badge
                variant={bateu ? 'default' : 'secondary'}
                className={bateu ? 'w-fit bg-success-600 text-white' : 'w-fit'}
              >
                {bateu ? `Bateu! +${meta.pontos_bonus} pts` : 'Ainda não bateu'}
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      <NivelBadge pontos={minhaLinhaAnual?.pontos_total ?? 0} />
    </div>
  )
}
