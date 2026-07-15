import { motion } from 'framer-motion'
import { ArrowDown, ArrowRight, ArrowUp, Crown, Target, Trophy, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress, ProgressTrack, ProgressIndicator } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { AnimatedNumber } from '@/components/ranking/AnimatedNumber'
import type { RankingLinhaComEvolucao } from '@/hooks/useRanking'

function SetaDelta({ valor }: { valor: number }) {
  if (valor > 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-success-600 dark:text-success-400">
        <ArrowUp className="size-3.5" />+{valor}
      </span>
    )
  if (valor < 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-destructive">
        <ArrowDown className="size-3.5" />
        {valor}
      </span>
    )
  return (
    <span className="inline-flex items-center gap-0.5 text-muted-foreground">
      <ArrowRight className="size-3.5" />0
    </span>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  delay,
  children,
}: {
  icon: React.ElementType
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  delay: number
  children?: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay }}
    >
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardContent className="flex flex-col gap-2 px-5 py-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon className="size-4" />
            <span className="text-sm font-medium">{label}</span>
          </div>
          <span className="text-2xl font-semibold tabular-nums">{value}</span>
          {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
          {children}
        </CardContent>
      </Card>
    </motion.div>
  )
}

const MESES_REL = { mes: 'desde o mês passado', ano: 'desde o ano passado' }

interface SummaryCardsProps {
  linhas: RankingLinhaComEvolucao[]
  meuVendedoraId: string | null
  periodo: 'mes' | 'ano'
  totalParticipantes: number
}

export function SummaryCards({
  linhas,
  meuVendedoraId,
  periodo,
  totalParticipantes,
}: SummaryCardsProps) {
  const minha = linhas.find((l) => l.vendedora_id === meuVendedoraId)

  if (minha) {
    const acimaDeMim = linhas[minha.posicao - 2]
    const souLider = minha.posicao === 1
    const progresso = acimaDeMim
      ? Math.min(100, Math.round((minha.pontos_total / Math.max(1, acimaDeMim.pontos_total)) * 100))
      : 100

    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Trophy}
          label="Sua posição"
          value={
            <>
              <AnimatedNumber value={minha.posicao} />º
            </>
          }
          sub={<SetaDelta valor={minha.deltaPosicao} />}
          delay={0}
        >
          <span className="text-[11px] text-muted-foreground">{MESES_REL[periodo]}</span>
        </StatCard>

        <StatCard
          icon={Target}
          label="Sua pontuação"
          value={
            <>
              <AnimatedNumber value={minha.pontos_total} /> pts
            </>
          }
          delay={0.05}
        >
          <SetaDelta valor={minha.deltaPontos} />
          <span className="ml-1 text-[11px] text-muted-foreground">
            {periodo === 'mes' ? 'este mês' : 'este ano'}
          </span>
        </StatCard>

        <StatCard
          icon={Crown}
          label={souLider ? 'Sua vantagem' : 'Faltam'}
          value={
            <>
              {souLider && '+'}
              <AnimatedNumber
                value={
                  souLider
                    ? minha.pontos_total - (linhas[1]?.pontos_total ?? 0)
                    : (acimaDeMim?.pontos_total ?? minha.pontos_total) - minha.pontos_total
                }
              />{' '}
              pts
            </>
          }
          delay={0.1}
        >
          {souLider ? (
            <span className="text-[11px] text-muted-foreground">de vantagem sobre o 2º lugar</span>
          ) : (
            <>
              <span className="text-[11px] text-muted-foreground">
                para alcançar {acimaDeMim?.nome}
              </span>
              <Progress value={progresso} className="mt-1.5">
                <ProgressTrack className="h-1.5">
                  <ProgressIndicator
                    className={cn(progresso >= 90 ? 'bg-success-500' : 'bg-primary')}
                  />
                </ProgressTrack>
              </Progress>
            </>
          )}
        </StatCard>

        <StatCard
          icon={Users}
          label="Participantes"
          value={<AnimatedNumber value={totalParticipantes} />}
          delay={0.15}
        >
          <span className="text-[11px] text-muted-foreground">colaboradoras ativas</span>
        </StatCard>
      </div>
    )
  }

  // Sem vendedora vinculada (gestor, ou visualizador sem nome correspondente):
  // cards de visão geral em vez de métricas pessoais que não existem.
  const lider = linhas[0]
  const vice = linhas[1]
  const maiorEvolucao = [...linhas].sort((a, b) => b.deltaPontos - a.deltaPontos)[0]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        icon={Crown}
        label="Líder atual"
        value={lider ? lider.nome : '—'}
        delay={0}
      >
        <span className="text-[11px] text-muted-foreground">{lider?.pontos_total ?? 0} pts</span>
      </StatCard>

      <StatCard
        icon={Target}
        label="Distância 1º → 2º"
        value={
          lider && vice ? (
            <>
              <AnimatedNumber value={lider.pontos_total - vice.pontos_total} /> pts
            </>
          ) : (
            '—'
          )
        }
        delay={0.05}
      >
        <span className="text-[11px] text-muted-foreground">
          {vice ? `${vice.nome} em 2º` : 'ainda sem 2º colocado'}
        </span>
      </StatCard>

      <StatCard
        icon={Trophy}
        label="Maior evolução"
        value={maiorEvolucao && maiorEvolucao.deltaPontos > 0 ? maiorEvolucao.nome : '—'}
        delay={0.1}
      >
        {maiorEvolucao && maiorEvolucao.deltaPontos > 0 && <SetaDelta valor={maiorEvolucao.deltaPontos} />}
      </StatCard>

      <StatCard
        icon={Users}
        label="Participantes"
        value={<AnimatedNumber value={totalParticipantes} />}
        delay={0.15}
      >
        <span className="text-[11px] text-muted-foreground">colaboradoras ativas</span>
      </StatCard>
    </div>
  )
}
