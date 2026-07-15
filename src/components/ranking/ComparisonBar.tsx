import type { RankingLinhaComEvolucao } from '@/hooks/useRanking'

interface ComparisonBarProps {
  minha: RankingLinhaComEvolucao
  lider: RankingLinhaComEvolucao
}

export function ComparisonBar({ minha, lider }: ComparisonBarProps) {
  const max = lider.pontos_total || 1
  const minhaPct = Math.min(100, Math.round((minha.pontos_total / max) * 100))

  return (
    <div className="rounded-xl border p-4">
      <h2 className="mb-4 text-sm font-semibold">Comparação com o líder</h2>
      <div className="flex flex-col gap-3">
        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium text-brand-700 dark:text-brand-300">Você</span>
            <span className="font-semibold tabular-nums">{minha.pontos_total} pts</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-brand-500 transition-[width] duration-500"
              style={{ width: `${minhaPct}%` }}
            />
          </div>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium">{lider.nome} (líder)</span>
            <span className="font-semibold tabular-nums">{lider.pontos_total} pts</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full w-full rounded-full bg-slate-400 dark:bg-slate-500" />
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Faltam {lider.pontos_total - minha.pontos_total} pontos para empatar com {lider.nome}.
      </p>
    </div>
  )
}
