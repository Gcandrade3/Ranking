import { useCallback, useEffect, useId, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Registro } from '@/types/database'

export function useFilaValidacao() {
  const [registros, setRegistros] = useState<Registro[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const instanceId = useId()

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('registros')
      .select('*')
      .eq('status', 'pendente')
      .order('created_at', { ascending: true })
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
      .channel(`fila-validacao-realtime-${instanceId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registros' }, refresh)
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [refresh, instanceId])

  async function validar(id: string) {
    const { error } = await supabase.from('registros').update({ status: 'validado' }).eq('id', id)
    if (error) return { error: error.message }
    await refresh()
    return { error: null }
  }

  async function rejeitar(id: string) {
    const { error } = await supabase
      .from('registros')
      .update({ status: 'rejeitado' })
      .eq('id', id)
    if (error) return { error: error.message }
    await refresh()
    return { error: null }
  }

  return { registros, loading, error, refresh, validar, rejeitar }
}
