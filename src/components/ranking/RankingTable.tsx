import { motion } from 'framer-motion'
import { ArrowDown, ArrowRight, ArrowUp, Flame, TrendingDown } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { RankingLinhaComEvolucao } from '@/hooks/useRanking'

function iniciais(nome: string) {
  return nome
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

function Evolucao({ delta }: { delta: number }) {
  if (delta > 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-sm font-medium text-success-600 dark:text-success-400">
        <ArrowUp className="size-3.5" />
        {delta}
      </span>
    )
  if (delta < 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-sm font-medium text-destructive">
        <ArrowDown className="size-3.5" />
        {Math.abs(delta)}
      </span>
    )
  return (
    <span className="inline-flex items-center gap-0.5 text-sm font-medium text-muted-foreground">
      <ArrowRight className="size-3.5" />0
    </span>
  )
}

function StatusBadge({ linha }: { linha: RankingLinhaComEvolucao }) {
  if (linha.deltaPosicao > 0)
    return (
      <Badge className="gap-1 bg-success-100 text-success-700 dark:bg-success-950 dark:text-success-400">
        <Flame className="size-3" /> Em alta
      </Badge>
    )
  if (linha.deltaPosicao < 0)
    return (
      <Badge variant="destructive" className="gap-1">
        <TrendingDown className="size-3" /> Caiu
      </Badge>
    )
  return (
    <Badge variant="secondary" className="gap-1">
      Estável
    </Badge>
  )
}

interface RankingTableProps {
  linhas: RankingLinhaComEvolucao[]
  meuVendedoraId: string | null
  onSelect: (linha: RankingLinhaComEvolucao) => void
}

export function RankingTable({ linhas, meuVendedoraId, onSelect }: RankingTableProps) {
  return (
    <div>
      {/* Desktop / tablet: tabela de verdade */}
      <div className="hidden overflow-hidden rounded-xl border sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground uppercase">
              <th className="px-4 py-2.5 font-medium">#</th>
              <th className="px-4 py-2.5 font-medium">Nome</th>
              <th className="px-4 py-2.5 font-medium">Pontos</th>
              <th className="px-4 py-2.5 font-medium">Evolução</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {linhas.map((linha, i) => {
              const souEu = linha.vendedora_id === meuVendedoraId
              return (
                <motion.tr
                  key={linha.vendedora_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  onClick={() => onSelect(linha)}
                  className={cn(
                    'cursor-pointer transition-colors hover:bg-muted/50',
                    souEu && 'bg-brand-50/70 dark:bg-brand-950/40',
                  )}
                >
                  <td className="px-4 py-2.5 text-muted-foreground tabular-nums">{linha.posicao}º</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar size="sm">
                        {linha.avatar_url && <AvatarImage src={linha.avatar_url} alt={linha.nome} />}
                        <AvatarFallback className="text-[10px] font-semibold">
                          {iniciais(linha.nome)}
                        </AvatarFallback>
                      </Avatar>
                      <span className={cn('font-medium', souEu && 'text-brand-700 dark:text-brand-300')}>
                        {linha.nome}
                      </span>
                      {souEu && <Badge className="h-4.5 px-1.5 text-[10px]">Você</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 font-semibold tabular-nums">{linha.pontos_total} pts</td>
                  <td className="px-4 py-2.5">
                    <Evolucao delta={linha.deltaPosicao} />
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge linha={linha} />
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards empilhados em vez de tabela */}
      <div className="flex flex-col gap-2 sm:hidden">
        {linhas.map((linha, i) => {
          const souEu = linha.vendedora_id === meuVendedoraId
          return (
            <motion.button
              key={linha.vendedora_id}
              type="button"
              onClick={() => onSelect(linha)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              className={cn(
                'flex items-center gap-3 rounded-xl border px-3 py-3 text-left',
                souEu && 'border-brand-300 bg-brand-50/70 dark:border-brand-800 dark:bg-brand-950/40',
              )}
            >
              <span className="w-5 shrink-0 text-center text-sm text-muted-foreground tabular-nums">
                {linha.posicao}º
              </span>
              <Avatar size="sm">
                {linha.avatar_url && <AvatarImage src={linha.avatar_url} alt={linha.nome} />}
                <AvatarFallback className="text-[10px] font-semibold">
                  {iniciais(linha.nome)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-medium">{linha.nome}</span>
                  {souEu && <Badge className="h-4.5 px-1.5 text-[10px]">Você</Badge>}
                </div>
                <StatusBadge linha={linha} />
              </div>
              <div className="flex shrink-0 flex-col items-end gap-0.5">
                <span className="font-semibold tabular-nums">{linha.pontos_total} pts</span>
                <Evolucao delta={linha.deltaPosicao} />
              </div>
            </motion.button>
          )
        })}
      </div>

      {linhas.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Ninguém pontuou neste período ainda.
        </p>
      )}
    </div>
  )
}
