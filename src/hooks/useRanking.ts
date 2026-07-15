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

export async function fetchMensal(ano: number, mes: number): Promise<RankingLinha[]> {
  const [{ data: vendedoras, error: vendedorasError }, { data: ranking, error: rankingError }] =
    await Promise.all([
      supabase.from('vendedoras').select('id, nome, avatar_url').eq('ativo', true),
      supabase.from('ranking_mensal').select('*').eq('ano', ano).eq('mes', mes),
    ])
  if (vendedorasError) throw new Error(vendedorasError.message)
  if (rankingError) throw new Error(rankingError.message)
  return mergeComVendedoras(vendedoras, ranking)
}

export async function fetchAnual(ano: number): Promise<RankingLinha[]> {
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

// Busca o "período anterior" equivalente (mês anterior, ou ano anterior) só
// pra servir de base de comparação — evolução de posição/pontos. Não assina
// realtime: é uma referência histórica que raramente muda depois de fechada.
export function useRankingAnterior(periodo: 'mes' | 'ano', ano: number, mes: number) {
  const [linhas, setLinhas] = useState<RankingLinha[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    const promise =
      periodo === 'mes'
        ? fetchMensal(mes === 1 ? ano - 1 : ano, mes === 1 ? 12 : mes - 1)
        : fetchAnual(ano - 1)
    promise
      .then((data) => {
        if (active) setLinhas(data)
      })
      .catch(() => {
        if (active) setLinhas([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [periodo, ano, mes])

  return { linhas, loading }
}

export interface RankingLinhaComEvolucao extends RankingLinha {
  posicao: number
  posicaoAnterior: number
  deltaPosicao: number
  deltaPontos: number
}

// Combina o ranking atual com o anterior pra saber quem subiu/desceu e quanto
// ganhou desde o período passado. Vendedoras sem histórico anterior (ex.:
// primeiro mês) entram com a mesma posição/pontos atuais, ou seja, delta 0.
export function comEvolucao(
  linhas: RankingLinha[],
  anteriores: RankingLinha[],
): RankingLinhaComEvolucao[] {
  const posicaoAnteriorPorId = new Map(anteriores.map((l, i) => [l.vendedora_id, i + 1]))
  const pontosAnteriorPorId = new Map(anteriores.map((l) => [l.vendedora_id, l.pontos_total]))

  return linhas.map((linha, i) => {
    const posicao = i + 1
    const posicaoAnterior = posicaoAnteriorPorId.get(linha.vendedora_id) ?? posicao
    const pontosAnterior = pontosAnteriorPorId.get(linha.vendedora_id) ?? linha.pontos_total
    return {
      ...linha,
      posicao,
      posicaoAnterior,
      deltaPosicao: posicaoAnterior - posicao,
      deltaPontos: linha.pontos_total - pontosAnterior,
    }
  })
}
