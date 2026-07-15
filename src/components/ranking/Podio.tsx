import { motion } from 'framer-motion'
import { Crown } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { RankingLinha } from '@/hooks/useRanking'

const medalStyles = [
  {
    order: 'order-2',
    height: 'h-16',
    ring: 'ring-brand-400',
    base: 'bg-gradient-to-b from-brand-400 to-brand-600 text-white shadow-[0_2px_10px_-2px_var(--color-brand-500)]',
  },
  {
    order: 'order-1',
    height: 'h-11',
    ring: 'ring-slate-300',
    base: 'bg-gradient-to-b from-slate-300 to-slate-400 text-slate-900',
  },
  {
    order: 'order-3',
    height: 'h-9',
    ring: 'ring-amber-700',
    base: 'bg-gradient-to-b from-amber-600 to-amber-800 text-white',
  },
]

function iniciais(nome: string) {
  return nome
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

export function Podio<T extends RankingLinha>({
  top3,
  onSelect,
}: {
  top3: T[]
  onSelect?: (linha: T) => void
}) {
  if (top3.length === 0) return null

  const diferencaPara2 = top3.length > 1 ? top3[0].pontos_total - top3[1].pontos_total : null

  return (
    <div className="flex items-end justify-center gap-3 px-4 pt-4 pb-1">
      {top3.map((linha, i) => {
        const style = medalStyles[i]
        return (
          <motion.button
            key={linha.vendedora_id}
            type="button"
            onClick={() => onSelect?.(linha)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.08 }}
            className={cn(
              'flex flex-1 flex-col items-center rounded-xl px-1 py-2 transition-colors hover:bg-muted/50',
              style.order,
            )}
          >
            {i === 0 && <Crown className="mb-1 size-5 text-brand-500" />}
            <Avatar size="lg" className={cn('ring-2', style.ring)}>
              {linha.avatar_url && <AvatarImage src={linha.avatar_url} alt={linha.nome} />}
              <AvatarFallback className="font-semibold">{iniciais(linha.nome)}</AvatarFallback>
            </Avatar>
            <p className="mt-2 line-clamp-1 max-w-24 text-center text-sm font-medium">
              {linha.nome}
            </p>
            <p className="text-base font-semibold text-brand-600 dark:text-brand-400">
              {linha.pontos_total} <span className="text-xs font-normal text-muted-foreground">pts</span>
            </p>
            {i === 0 && diferencaPara2 !== null && diferencaPara2 > 0 && (
              <p className="text-[11px] text-muted-foreground">+{diferencaPara2} sobre o 2º</p>
            )}
            <div
              className={cn(
                'mt-2 flex w-full items-center justify-center rounded-t-lg text-sm font-bold',
                style.height,
                style.base,
              )}
            >
              {i + 1}º
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
