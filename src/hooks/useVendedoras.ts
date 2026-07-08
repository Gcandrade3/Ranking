import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Vendedora } from '@/types/database'

export interface VendedoraInput {
  nome: string
  email: string
  avatar_url?: string | null
}

export function useVendedoras() {
  const [vendedoras, setVendedoras] = useState<Vendedora[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('vendedoras')
      .select('*')
      .order('nome', { ascending: true })
    if (error) setError(error.message)
    else {
      setVendedoras(data)
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function createVendedora(input: VendedoraInput) {
    const { error } = await supabase.from('vendedoras').insert(input)
    if (error) return { error: error.message }
    await refresh()
    return { error: null }
  }

  async function updateVendedora(
    id: string,
    input: Partial<VendedoraInput> & { ativo?: boolean },
  ) {
    const { error } = await supabase.from('vendedoras').update(input).eq('id', id)
    if (error) return { error: error.message }
    await refresh()
    return { error: null }
  }

  async function toggleAtivo(id: string, ativo: boolean) {
    return updateVendedora(id, { ativo })
  }

  return { vendedoras, loading, error, refresh, createVendedora, updateVendedora, toggleAtivo }
}
