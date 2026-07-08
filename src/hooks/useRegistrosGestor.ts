import { useCallback, useEffect, useId, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Registro } from '@/types/database'

export interface NovoRegistroGestorInput {
  vendedora_id: string
  acao_id: string
  quantidade: number
  cliente?: string | null
  observacao?: string | null
  data_ocorrencia: string
  comprovante?: File | null
}

export function useRegistrosGestor() {
  const [registros, setRegistros] = useState<Registro[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const instanceId = useId()

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('registros')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
    if (error) setError(error.message)
    else {
      setRegistros(data)
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    const channel = supabase
      .channel(`registros-gestor-realtime-${instanceId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registros' }, refresh)
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [refresh, instanceId])

  async function criarRegistro(input: NovoRegistroGestorInput) {
    let comprovante_url: string | null = null
    if (input.comprovante) {
      const path = `${input.vendedora_id}/${Date.now()}-${input.comprovante.name}`
      const { error: uploadError } = await supabase.storage
        .from('comprovantes')
        .upload(path, input.comprovante)
      if (uploadError) return { error: uploadError.message }
      comprovante_url = path
    }

    const { error } = await supabase.from('registros').insert({
      vendedora_id: input.vendedora_id,
      acao_id: input.acao_id,
      quantidade: input.quantidade,
      cliente: input.cliente || null,
      observacao: input.observacao || null,
      data_ocorrencia: input.data_ocorrencia,
      comprovante_url,
      status: 'validado',
    })
    if (error) return { error: error.message }
    await refresh()
    return { error: null }
  }

  async function excluir(id: string) {
    const { error } = await supabase.from('registros').delete().eq('id', id)
    if (error) return { error: error.message }
    await refresh()
    return { error: null }
  }

  return { registros, loading, error, refresh, criarRegistro, excluir }
}
