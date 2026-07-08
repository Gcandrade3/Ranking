import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Registro } from '@/types/database'

export interface RegistroInput {
  acao_id: string
  quantidade: number
  cliente?: string | null
  observacao?: string | null
  data_ocorrencia: string
  comprovante?: File | null
}

export function useMeusRegistros(vendedoraId: string | null | undefined) {
  const [registros, setRegistros] = useState<Registro[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!vendedoraId) {
      setRegistros([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('registros')
      .select('*')
      .eq('vendedora_id', vendedoraId)
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else {
      setRegistros(data)
      setError(null)
    }
    setLoading(false)
  }, [vendedoraId])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function createRegistro(input: RegistroInput) {
    if (!vendedoraId) return { error: 'Vendedora não identificada.' }

    let comprovante_url: string | null = null
    if (input.comprovante) {
      const path = `${vendedoraId}/${Date.now()}-${input.comprovante.name}`
      const { error: uploadError } = await supabase.storage
        .from('comprovantes')
        .upload(path, input.comprovante)
      if (uploadError) return { error: uploadError.message }
      comprovante_url = path
    }

    const { error } = await supabase.from('registros').insert({
      vendedora_id: vendedoraId,
      acao_id: input.acao_id,
      quantidade: input.quantidade,
      cliente: input.cliente || null,
      observacao: input.observacao || null,
      data_ocorrencia: input.data_ocorrencia,
      comprovante_url,
    })
    if (error) return { error: error.message }
    await refresh()
    return { error: null }
  }

  return { registros, loading, error, refresh, createRegistro }
}
