import { useCallback, useEffect, useId, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface RankingLinha {
  vendedora_id: string
  nome: string
  avatar_url: string | null
  pontos_registros: number
  pontos_bonus: number
  pontos_total: number
}

async function fetchMensal(ano: number, mes: number): Promise<RankingLinha[]> {
  const [{ data: vendedoras, error: vendedorasError }, { data: ranking, error: rankingError }] =
    await Promise.all([
      supabase.from('vendedoras').select('id, nome, avatar_url').eq('ativo', true),
      supabase.from('ranking_mensal').select('*').eq('ano', ano).eq('mes', mes),
    ])
  if (vendedorasError) throw new Error(vendedorasError.message)
  if (rankingError) throw new Error(rankingError.message)
  return mergeComVendedoras(vendedoras, ranking)
}

async function fetchAnual(ano: number): Promise<RankingLinha[]> {
  const [{ data: vendedoras, error: vendedorasError }, { data: ranking, error: rankingError }] =
    await Promise.all([
      supabase.from('vendedoras').select('id, nome, avatar_url').eq('ativo', true),
      supabase.from('ranking_anual').select('*').eq('ano', ano),
    ])
  if (vendedorasError) throw new Error(vendedorasError.message)
  if (rankingError) throw new Error(rankingError.message)
  return mergeComVendedoras(vendedoras, ranking)
}

function mergeComVendedoras(
  vendedoras: { id: string; nome: string; avatar_url: string | null }[] | null,
  ranking: { vendedora_id: string; pontos_registros: number; pontos_bonus: number; pontos_total: number }[] | null,
): RankingLinha[] {
  const porVendedora = new Map((ranking ?? []).map((r) => [r.vendedora_id, r]))
  const linhas = (vendedoras ?? []).map((v) => {
    const r = porVendedora.get(v.id)
    return {
      vendedora_id: v.id,
      nome: v.nome,
      avatar_url: v.avatar_url,
      pontos_registros: r?.pontos_registros ?? 0,
      pontos_bonus: r?.pontos_bonus ?? 0,
      pontos_total: r?.pontos_total ?? 0,
    }
  })
  return linhas.sort((a, b) => b.pontos_total - a.pontos_total)
}

export function useRanking(ano: number, mes: number) {
  const [mensal, setMensal] = useState<RankingLinha[]>([])
  const [anual, setAnual] = useState<RankingLinha[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Nome de canal precisa ser único por instância — duas telas usando este hook
  // ao mesmo tempo (ex.: ResumoMensal + VendedoraDoMes) não podem dividir um canal,
  // senão a segunda `.on()` falha com "cannot add callbacks after subscribe()".
  const instanceId = useId()

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [m, a] = await Promise.all([fetchMensal(ano, mes), fetchAnual(ano)])
      setMensal(m)
      setAnual(a)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar ranking.')
    }
    setLoading(false)
  }, [ano, mes])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    const channel = supabase
      .channel(`ranking-realtime-${instanceId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registros' }, refresh)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'metas_atingidas' },
        refresh,
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [refresh, instanceId])

  return { mensal, anual, loading, error, refresh }
}
