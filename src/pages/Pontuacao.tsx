import { useMemo } from 'react'
import { AlertTriangle, Handshake, Heart, Search, type LucideIcon } from 'lucide-react'
import { useAcoesCatalogo } from '@/hooks/useAcoesCatalogo'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { AcaoCatalogo } from '@/types/database'

const CATEGORIA_INFO: Record<string, { label: string; icon: LucideIcon }> = {
  venda: { label: 'Vendas', icon: Handshake },
  relacionamento: { label: 'Relacionamento', icon: Heart },
  prospeccao: { label: 'Prospecção', icon: Search },
  penalidade: { label: 'Penalidades', icon: AlertTriangle },
}

function pontosBadgeClass(pontos: number) {
  return pontos < 0
    ? 'bg-destructive/10 text-destructive'
    : 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
}

export default function Pontuacao() {
  const { acoes, loading, error } = useAcoesCatalogo()

  const grupos = useMemo(() => {
    const ativas = [...acoes].filter((a) => a.ativo).sort((a, b) => a.ordem - b.ordem)
    const mapa = new Map<string, AcaoCatalogo[]>()
    for (const acao of ativas) {
      const chave = acao.categoria ?? 'outros'
      if (!mapa.has(chave)) mapa.set(chave, [])
      mapa.get(chave)!.push(acao)
    }
    return Array.from(mapa.entries())
  }, [acoes])

  return (
    <div className="p-4">
      <h1 className="mb-1 text-2xl font-semibold">De onde vêm os pontos</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Cada ação lançada e validada pelo gestor soma (ou desconta) esses pontos no ranking.
      </p>

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {grupos.map(([categoria, itens]) => {
            const info = CATEGORIA_INFO[categoria]
            const Icon = info?.icon ?? Search
            const ehPenalidade = categoria === 'penalidade'
            return (
              <div
                key={categoria}
                className={cn(
                  'overflow-hidden rounded-xl border',
                  ehPenalidade && 'border-destructive/30',
                )}
              >
                <div
                  className={cn(
                    'flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5',
                    ehPenalidade && 'border-destructive/30 bg-destructive/5',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-7 items-center justify-center rounded-full',
                      ehPenalidade
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300',
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <h2 className="text-sm font-semibold">{info?.label ?? categoria}</h2>
                  <span className="ml-auto text-xs text-muted-foreground">{itens.length}</span>
                </div>
                <div className="divide-y">
                  {itens.map((acao) => (
                    <div key={acao.id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <span className="text-sm">{acao.descricao}</span>
                      <span
                        className={cn(
                          'shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold',
                          pontosBadgeClass(acao.pontos),
                        )}
                      >
                        {acao.pontos > 0 ? '+' : ''}
                        {acao.pontos}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
          {grupos.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma ação cadastrada ainda.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
