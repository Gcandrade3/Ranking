import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { AcaoCatalogo } from '@/types/database'

export interface AcaoCatalogoInput {
  descricao: string
  pontos: number
  categoria?: string | null
  ordem?: number
}

export function useAcoesCatalogo() {
  const [acoes, setAcoes] = useState<AcaoCatalogo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('acoes_catalogo')
      .select('*')
      .order('ordem', { ascending: true })
    if (error) setError(error.message)
    else {
      setAcoes(data)
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function createAcao(input: AcaoCatalogoInput) {
    const { error } = await supabase.from('acoes_catalogo').insert(input)
    if (error) return { error: error.message }
    await refresh()
    return { error: null }
  }

  async function updateAcao(
    id: string,
    input: Partial<AcaoCatalogoInput> & { ativo?: boolean },
  ) {
    const { error } = await supabase.from('acoes_catalogo').update(input).eq('id', id)
    if (error) return { error: error.message }
    await refresh()
    return { error: null }
  }

  async function toggleAtivo(id: string, ativo: boolean) {
    return updateAcao(id, { ativo })
  }

  return { acoes, loading, error, refresh, createAcao, updateAcao, toggleAtivo }
}
