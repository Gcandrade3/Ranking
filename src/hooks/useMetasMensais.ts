import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { MetaMensal } from '@/types/database'

export interface MetaMensalInput {
  descricao_meta: string
  pontos_bonus: number
}

export function useMetasMensais(ano: number) {
  const [metas, setMetas] = useState<MetaMensal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('metas_mensais')
      .select('*')
      .eq('ano', ano)
      .order('mes', { ascending: true })
    if (error) setError(error.message)
    else {
      setMetas(data)
      setError(null)
    }
    setLoading(false)
  }, [ano])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function updateMeta(id: string, input: Partial<MetaMensalInput>) {
    const { error } = await supabase.from('metas_mensais').update(input).eq('id', id)
    if (error) return { error: error.message }
    await refresh()
    return { error: null }
  }

  return { metas, loading, error, refresh, updateMeta }
}
