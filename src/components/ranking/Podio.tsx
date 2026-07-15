import { Crown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RankingLinha } from '@/hooks/useRanking'

const medalStyles = [
  { order: 'order-2', height: 'h-28', ring: 'ring-brand-500', badge: 'bg-brand-500 text-primary-foreground' },
  { order: 'order-1', height: 'h-20', ring: 'ring-slate-300', badge: 'bg-slate-300 text-slate-900' },
  { order: 'order-3', height: 'h-16', ring: 'ring-amber-700', badge: 'bg-amber-700 text-white' },
]

function iniciais(nome: string) {
  return nome
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

export function Podio({
  top3,
  onSelect,
}: {
  top3: RankingLinha[]
  onSelect?: (linha: RankingLinha) => void
}) {
  if (top3.length === 0) return null

  return (
    <div className="flex items-end justify-center gap-3 px-4 pt-6 pb-2">
      {top3.map((linha, i) => {
        const style = medalStyles[i]
        return (
          <button
            key={linha.vendedora_id}
            type="button"
            onClick={() => onSelect?.(linha)}
            className={cn(
              'flex flex-1 flex-col items-center rounded-lg transition-opacity hover:opacity-80',
              style.order,
            )}
          >
            {i === 0 && <Crown className="mb-1 size-5 text-brand-500" />}
            <div
              className={cn(
                'flex size-14 items-center justify-center rounded-full bg-muted font-semibold ring-2',
                style.ring,
              )}
            >
              {iniciais(linha.nome)}
            </div>
            <p className="mt-2 line-clamp-1 text-center text-sm font-medium">{linha.nome}</p>
            <p className="text-xs text-muted-foreground">{linha.pontos_total} pts</p>
            <div
              className={cn(
                'mt-2 flex w-full items-center justify-center rounded-t-lg text-sm font-bold',
                style.height,
                style.badge,
              )}
            >
              {i + 1}º
            </div>
          </button>
        )
      })}
    </div>
  )
}
