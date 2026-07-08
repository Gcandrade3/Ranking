import { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ChevronRight, ClipboardList, Plus, Target, TrendingUp, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRanking } from '@/hooks/useRanking'
import { useRegistrosGestor } from '@/hooks/useRegistrosGestor'
import { useVendedoras } from '@/hooks/useVendedoras'
import { useAcoesCatalogo } from '@/hooks/useAcoesCatalogo'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { VendedoraDoMes } from '@/components/gamification/VendedoraDoMes'
import { Podio } from '@/components/ranking/Podio'
import { GestorRegistroFormDialog } from '@/components/registros/GestorRegistroFormDialog'
import { comemorarVendaFechada } from '@/lib/confetti'

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

interface Stats {
  registrosMes: number
  vendedorasAtivas: number
  pontosMes: number
  metaDescricao: string | null
  metaBatidas: number
}

export default function GestorOverview() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const now = new Date()
  const { mensal, loading: loadingRanking } = useRanking(now.getFullYear(), now.getMonth() + 1)
  const { criarRegistro } = useRegistrosGestor()
  const { vendedoras } = useVendedoras()
  const { acoes } = useAcoesCatalogo()
  const vendedorasAtivas = useMemo(() => vendedoras.filter((v) => v.ativo), [vendedoras])
  const acaoPorId = useMemo(() => new Map(acoes.map((a) => [a.id, a])), [acoes])

  async function handleSubmit(input: Parameters<typeof criarRegistro>[0]) {
    const result = await criarRegistro(input)
    if (!result.error) {
      toast.success('Ação registrada e validada!')
      if (acaoPorId.get(input.acao_id)?.descricao.startsWith('Venda Fechada')) {
        comemorarVendaFechada()
      }
    }
    return result
  }

  const instanceId = useId()

  const loadStats = useCallback(async () => {
    const now = new Date()
    const ano = now.getFullYear()
    const mes = now.getMonth() + 1

    const [registrosMesRes, vendedorasRes, rankingRes, metaRes] = await Promise.all([
      supabase
        .from('registros')
        .select('id', { count: 'exact', head: true })
        .eq('ano_apuracao', ano)
        .eq('mes_apuracao', mes),
      supabase.from('vendedoras').select('id', { count: 'exact', head: true }).eq('ativo', true),
      supabase.from('ranking_mensal').select('pontos_total').eq('ano', ano).eq('mes', mes),
      supabase
        .from('metas_mensais')
        .select('id, descricao_meta')
        .eq('ano', ano)
        .eq('mes', mes)
        .single(),
    ])

    let metaBatidas = 0
    if (metaRes.data) {
      const { count } = await supabase
        .from('metas_atingidas')
        .select('id', { count: 'exact', head: true })
        .eq('meta_mensal_id', metaRes.data.id)
        .eq('atingido', true)
      metaBatidas = count ?? 0
    }

    setStats({
      registrosMes: registrosMesRes.count ?? 0,
      vendedorasAtivas: vendedorasRes.count ?? 0,
      pontosMes: (rankingRes.data ?? []).reduce((acc, r) => acc + r.pontos_total, 0),
      metaDescricao: metaRes.data?.descricao_meta ?? null,
      metaBatidas,
    })
    setLoading(false)
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  useEffect(() => {
    const channel = supabase
      .channel(`overview-stats-realtime-${instanceId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registros' }, loadStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'metas_atingidas' }, loadStats)
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadStats, instanceId])

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Visão geral</h1>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" />
          Registrar
        </Button>
      </div>

      <VendedoraDoMes />

      {loading || !stats ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link to="/admin/registros">
            <Card className="h-full transition-colors hover:bg-accent">
              <CardContent className="flex flex-col gap-1 px-4 py-3">
                <ClipboardList className="size-5 text-brand-600 dark:text-brand-400" />
                <span className="text-2xl font-semibold">{stats.registrosMes}</span>
                <span className="text-xs text-muted-foreground">
                  Registros em {MESES[now.getMonth()]}
                </span>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/vendedoras">
            <Card className="h-full transition-colors hover:bg-accent">
              <CardContent className="flex flex-col gap-1 px-4 py-3">
                <Users className="size-5 text-brand-600 dark:text-brand-400" />
                <span className="text-2xl font-semibold">{stats.vendedorasAtivas}</span>
                <span className="text-xs text-muted-foreground">Vendedoras ativas</span>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/ranking">
            <Card className="h-full transition-colors hover:bg-accent">
              <CardContent className="flex flex-col gap-1 px-4 py-3">
                <TrendingUp className="size-5 text-brand-600 dark:text-brand-400" />
                <span className="text-2xl font-semibold">{stats.pontosMes}</span>
                <span className="text-xs text-muted-foreground">
                  Pontos em {MESES[now.getMonth()]}
                </span>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/metas">
            <Card className="h-full transition-colors hover:bg-accent">
              <CardContent className="flex flex-col gap-1 px-4 py-3">
                <Target className="size-5 text-brand-600 dark:text-brand-400" />
                <span className="text-2xl font-semibold">
                  {stats.metaBatidas}/{stats.vendedorasAtivas}
                </span>
                <span className="text-xs text-muted-foreground">
                  Bateram a meta ({stats.metaDescricao ?? '—'})
                </span>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">
            Ranking de {MESES[now.getMonth()]}
          </h2>
          <Link
            to="/admin/ranking"
            className="flex items-center text-sm text-brand-600 hover:underline dark:text-brand-400"
          >
            Ver completo
            <ChevronRight className="size-4" />
          </Link>
        </div>

        {loadingRanking ? (
          <Skeleton className="h-40 w-full" />
        ) : mensal.some((l) => l.pontos_total > 0) ? (
          <Podio top3={mensal.slice(0, 3)} />
        ) : (
          <p className="rounded-lg border py-8 text-center text-sm text-muted-foreground">
            Ninguém pontuou este mês ainda.
          </p>
        )}
      </div>

      <GestorRegistroFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        vendedoras={vendedorasAtivas}
        acoes={acoes.filter((a) => a.ativo)}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
