import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Target, TrendingUp, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { VendedoraDoMes } from '@/components/gamification/VendedoraDoMes'

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

  useEffect(() => {
    const now = new Date()
    const ano = now.getFullYear()
    const mes = now.getMonth() + 1

    async function load() {
      const [registrosMesRes, vendedorasRes, rankingRes, metaRes] = await Promise.all([
        supabase
          .from('registros')
          .select('id', { count: 'exact', head: true })
          .eq('ano_apuracao', ano)
          .eq('mes_apuracao', mes),
        supabase.from('vendedoras').select('id', { count: 'exact', head: true }).eq('ativo', true),
        supabase.from('ranking_mensal').select('pontos_total').eq('ano', ano).eq('mes', mes),
        supabase.from('metas_mensais').select('id, descricao_meta').eq('ano', ano).eq('mes', mes).single(),
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
    }

    load()
  }, [])

  const now = new Date()

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-semibold">Visão geral</h1>

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
    </div>
  )
}
