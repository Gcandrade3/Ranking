import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface Conquistas {
  totalVendas: number
  totalIndicacoes: number
  metasBatidas: number
}

export function useConquistas(vendedoraId: string | null | undefined) {
  const [conquistas, setConquistas] = useState<Conquistas | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      if (!vendedoraId) {
        setConquistas(null)
        setLoading(false)
        return
      }
      setLoading(true)
      const [{ data: registros }, { data: acoes }, { count: metasBatidas }] = await Promise.all([
        supabase
          .from('registros')
          .select('acao_id')
          .eq('vendedora_id', vendedoraId)
          .eq('status', 'validado'),
        supabase.from('acoes_catalogo').select('id, descricao'),
        supabase
          .from('metas_atingidas')
          .select('id', { count: 'exact', head: true })
          .eq('vendedora_id', vendedoraId)
          .eq('atingido', true),
      ])
      if (!active) return

      const descricaoPorAcaoId = new Map((acoes ?? []).map((a) => [a.id, a.descricao]))
      let totalVendas = 0
      let totalIndicacoes = 0
      for (const r of registros ?? []) {
        const descricao = descricaoPorAcaoId.get(r.acao_id) ?? ''
        if (descricao.startsWith('Venda Fechada')) totalVendas++
        if (descricao === 'Indicação recebida') totalIndicacoes++
      }

      setConquistas({ totalVendas, totalIndicacoes, metasBatidas: metasBatidas ?? 0 })
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [vendedoraId])

  return { conquistas, loading }
}
