import { useMemo, useState } from 'react'
import { useEvolucaoAnual } from '@/hooks/useEvolucaoAnual'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const MESES_ABREV = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

interface EvolutionChartProps {
  vendedoraId: string | null
  ano: number
  mesAtual: number
}

export function EvolutionChart({ vendedoraId, ano, mesAtual }: EvolutionChartProps) {
  const { pontos, loading } = useEvolucaoAnual(ano, mesAtual)
  const [hover, setHover] = useState<number | null>(null)

  const serie = useMemo(
    () => pontos.map((p) => ({ mes: p.mes, valor: vendedoraId ? (p.valores[vendedoraId] ?? 0) : 0 })),
    [pontos, vendedoraId],
  )
  const max = Math.max(1, ...serie.map((s) => s.valor))
  const temPontos = serie.some((s) => s.valor > 0)

  if (!vendedoraId) return null

  return (
    <div className="rounded-xl border p-4">
      <h2 className="text-sm font-semibold">Sua evolução em {ano}</h2>
      <p className="mb-4 text-xs text-muted-foreground">Pontos totais por mês</p>

      {loading ? (
        <Skeleton className="h-32 w-full" />
      ) : !temPontos ? (
        <div className="flex h-32 items-center justify-center text-center text-sm text-muted-foreground">
          Ainda sem pontos registrados em {ano}.
        </div>
      ) : (
        <div className="flex h-32 items-end gap-1.5">
          {serie.map((s) => {
            const alturaPct = Math.max(4, Math.round((s.valor / max) * 100))
            const ehAtual = s.mes === mesAtual
            return (
              <div
                key={s.mes}
                className="group relative flex flex-1 flex-col items-center justify-end gap-1"
                onMouseEnter={() => setHover(s.mes)}
                onMouseLeave={() => setHover(null)}
              >
                {hover === s.mes && (
                  <div className="absolute -top-7 z-10 rounded-md bg-foreground px-2 py-1 text-[11px] font-medium whitespace-nowrap text-background shadow-md">
                    {MESES_ABREV[s.mes - 1]}: {s.valor} pts
                  </div>
                )}
                <div
                  className={cn(
                    'w-full rounded-t-md transition-colors',
                    ehAtual
                      ? 'bg-brand-500'
                      : 'bg-brand-200 group-hover:bg-brand-300 dark:bg-brand-900 dark:group-hover:bg-brand-800',
                  )}
                  style={{ height: `${alturaPct}%` }}
                />
                <span
                  className={cn(
                    'text-[10px]',
                    ehAtual ? 'font-semibold text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {MESES_ABREV[s.mes - 1]}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
