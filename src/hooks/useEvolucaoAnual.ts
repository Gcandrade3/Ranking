import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface SeriePonto {
  mes: number
  valores: Record<string, number>
}

export interface SerieVendedora {
  id: string
  nome: string
}

export function useEvolucaoAnual(ano: number, ateMes: number) {
  const [pontos, setPontos] = useState<SeriePonto[]>([])
  const [vendedoras, setVendedoras] = useState<SerieVendedora[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      const [{ data: vendedorasData }, { data: rankingData }] = await Promise.all([
        supabase.from('vendedoras').select('id, nome').eq('ativo', true).order('nome'),
        supabase.from('ranking_mensal').select('vendedora_id, mes, pontos_total').eq('ano', ano),
      ])
      if (!active) return

      const vs = vendedorasData ?? []
      setVendedoras(vs)

      const porMes = new Map<number, Record<string, number>>()
      for (let mes = 1; mes <= ateMes; mes++) {
        porMes.set(mes, Object.fromEntries(vs.map((v) => [v.id, 0])))
      }
      for (const r of rankingData ?? []) {
        const linha = porMes.get(r.mes)
        if (linha) linha[r.vendedora_id] = r.pontos_total
      }
      setPontos(
        Array.from(porMes.entries())
          .sort(([a], [b]) => a - b)
          .map(([mes, valores]) => ({ mes, valores })),
      )
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [ano, ateMes])

  return { pontos, vendedoras, loading }
}
