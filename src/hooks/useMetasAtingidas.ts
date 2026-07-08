import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useMetasAtingidas(metaMensalId: string | null) {
  const [vendedoraIds, setVendedoraIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!metaMensalId) {
      setVendedoraIds(new Set())
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('metas_atingidas')
      .select('vendedora_id')
      .eq('meta_mensal_id', metaMensalId)
      .eq('atingido', true)
    if (error) setError(error.message)
    else {
      setVendedoraIds(new Set(data.map((r) => r.vendedora_id)))
      setError(null)
    }
    setLoading(false)
  }, [metaMensalId])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function toggle(vendedoraId: string, atingiu: boolean) {
    if (!metaMensalId) return { error: 'Meta não identificada.' }
    if (atingiu) {
      const { error } = await supabase
        .from('metas_atingidas')
        .insert({ meta_mensal_id: metaMensalId, vendedora_id: vendedoraId, atingido: true })
      if (error) return { error: error.message }
    } else {
      const { error } = await supabase
        .from('metas_atingidas')
        .delete()
        .eq('meta_mensal_id', metaMensalId)
        .eq('vendedora_id', vendedoraId)
      if (error) return { error: error.message }
    }
    await refresh()
    return { error: null }
  }

  return { vendedoraIds, loading, error, refresh, toggle }
}
