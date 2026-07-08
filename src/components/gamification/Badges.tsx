import { Award, Handshake, Lock, Target, TrendingUp, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useConquistas } from '@/hooks/useConquistas'
import type { Conquistas } from '@/hooks/useConquistas'

interface BadgeDef {
  nome: string
  icone: LucideIcon
  conquistado: (c: Conquistas) => boolean
}

const BADGES: BadgeDef[] = [
  {
    nome: 'Primeira venda',
    icone: Award,
    conquistado: (c) => c.totalVendas >= 1,
  },
  {
    nome: '5 vendas fechadas',
    icone: TrendingUp,
    conquistado: (c) => c.totalVendas >= 5,
  },
  {
    nome: 'Rede de indicações',
    icone: Handshake,
    conquistado: (c) => c.totalIndicacoes >= 3,
  },
  {
    nome: 'Meta batida',
    icone: Target,
    conquistado: (c) => c.metasBatidas >= 1,
  },
]

export function Badges({ vendedoraId }: { vendedoraId: string | null | undefined }) {
  const { conquistas, loading } = useConquistas(vendedoraId)

  if (loading || !conquistas) return null

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {BADGES.map((badge) => {
        const conquistado = badge.conquistado(conquistas)
        const Icone = conquistado ? badge.icone : Lock
        return (
          <div
            key={badge.nome}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center',
              conquistado
                ? 'border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-950'
                : 'opacity-50',
            )}
          >
            <Icone
              className={cn(
                'size-6',
                conquistado ? 'text-brand-600 dark:text-brand-400' : 'text-muted-foreground',
              )}
            />
            <span className="text-xs font-medium">{badge.nome}</span>
          </div>
        )
      })}
    </div>
  )
}
