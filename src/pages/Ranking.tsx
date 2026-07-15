import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRanking, useRankingAnterior, comEvolucao, type RankingLinhaComEvolucao } from '@/hooks/useRanking'
import { Podio } from '@/components/ranking/Podio'
import { SummaryCards } from '@/components/ranking/SummaryCards'
import { RankingTable } from '@/components/ranking/RankingTable'
import { EvolutionChart } from '@/components/ranking/EvolutionChart'
import { Insights } from '@/components/ranking/Insights'
import { ComparisonBar } from '@/components/ranking/ComparisonBar'
import { ExtratoDialog } from '@/components/ranking/ExtratoDialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/lib/auth'
import { normalizarNome } from '@/lib/utils'

const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

export default function RankingPage() {
  const now = new Date()
  const [ano, setAno] = useState(now.getFullYear())
  const [mes, setMes] = useState(now.getMonth() + 1)
  const [periodo, setPeriodo] = useState<'mes' | 'ano'>('mes')
  const { profile } = useAuth()
  const { mensal, anual, loading, error } = useRanking(ano, mes)
  const { linhas: anteriores, loading: loadingAnterior } = useRankingAnterior(periodo, ano, mes)
  const [selecionada, setSelecionada] = useState<RankingLinhaComEvolucao | null>(null)

  const linhasBase = periodo === 'mes' ? mensal : anual
  const linhas = useMemo(() => comEvolucao(linhasBase, anteriores), [linhasBase, anteriores])

  const meuVendedoraId = useMemo(() => {
    if (profile?.vendedora_id) return profile.vendedora_id
    if (!profile?.nome) return null
    const alvo = normalizarNome(profile.nome)
    return linhas.find((l) => normalizarNome(l.nome) === alvo)?.vendedora_id ?? null
  }, [profile, linhas])

  const minha = linhas.find((l) => l.vendedora_id === meuVendedoraId)
  const lider = linhas[0]
  const mostrarComparacao = minha && lider && minha.posicao !== 1

  const top3 = linhas.slice(0, 3)
  const carregando = loading || loadingAnterior

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight sm:text-[32px]">
            Ranking de Pontuação
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Acompanhe sua posição e evolução no programa de premiações.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Tabs value={periodo} onValueChange={(v) => setPeriodo(v as 'mes' | 'ano')}>
            <TabsList>
              <TabsTrigger value="mes">Mês</TabsTrigger>
              <TabsTrigger value="ano">Ano</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-1">
            {periodo === 'mes' && (
              <Select value={String(mes)} onValueChange={(v) => v && setMes(Number(v))}>
                <SelectTrigger size="sm" className="w-[120px]">
                  <SelectValue>{MESES[mes - 1]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {MESES.map((nome, idx) => (
                    <SelectItem key={nome} value={String(idx + 1)}>
                      {nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button variant="ghost" size="icon" onClick={() => setAno(ano - 1)} aria-label="Ano anterior">
              <ChevronLeft className="size-4" />
            </Button>
            <span className="w-10 text-center text-sm tabular-nums">{ano}</span>
            <Button variant="ghost" size="icon" onClick={() => setAno(ano + 1)} aria-label="Próximo ano">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {carregando ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${periodo}-${ano}-${mes}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col gap-4"
          >
            <SummaryCards
              linhas={linhas}
              meuVendedoraId={meuVendedoraId}
              periodo={periodo}
              totalParticipantes={linhas.length}
            />

            <Podio top3={top3} onSelect={setSelecionada} />

            <RankingTable linhas={linhas} meuVendedoraId={meuVendedoraId} onSelect={setSelecionada} />

            {(meuVendedoraId || mostrarComparacao) && (
              <div className="grid gap-4 lg:grid-cols-2">
                {meuVendedoraId && (
                  <EvolutionChart vendedoraId={meuVendedoraId} ano={ano} mesAtual={mes} />
                )}
                {mostrarComparacao && minha && lider && (
                  <ComparisonBar minha={minha} lider={lider} />
                )}
              </div>
            )}

            <Insights linhas={linhas} meuVendedoraId={meuVendedoraId} periodo={periodo} />
          </motion.div>
        </AnimatePresence>
      )}

      <ExtratoDialog
        linha={selecionada}
        ano={ano}
        mes={periodo === 'mes' ? mes : null}
        onOpenChange={(open) => {
          if (!open) setSelecionada(null)
        }}
      />
    </div>
  )
}
