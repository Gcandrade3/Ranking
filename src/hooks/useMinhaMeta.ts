import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { MetaMensal } from '@/types/database'

export function useMinhaMeta(vendedoraId: string | null | undefined, ano: number, mes: number) {
  const [meta, setMeta] = useState<MetaMensal | null>(null)
  const [bateu, setBateu] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      const { data: metaData } = await supabase
        .from('metas_mensais')
        .select('*')
        .eq('ano', ano)
        .eq('mes', mes)
        .maybeSingle()

      if (!active) return
      setMeta(metaData)

      if (metaData && vendedoraId) {
        const { data: atingida } = await supabase
          .from('metas_atingidas')
          .select('id')
          .eq('meta_mensal_id', metaData.id)
          .eq('vendedora_id', vendedoraId)
          .eq('atingido', true)
          .maybeSingle()
        if (!active) return
        setBateu(!!atingida)
      } else {
        setBateu(false)
      }
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [vendedoraId, ano, mes])

  return { meta, bateu, loading }
}
