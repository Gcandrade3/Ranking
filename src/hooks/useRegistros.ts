import { useCallback, useEffect, useId, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Registro } from '@/types/database'

// Só leitura: o extrato da vendedora, alimentado pelos registros que o
// gestor lança em nome dela (ela não registra nada por conta própria).
export function useMeusRegistros(vendedoraId: string | null | undefined) {
  const [registros, setRegistros] = useState<Registro[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const instanceId = useId()

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

  useEffect(() => {
    if (!vendedoraId) return
    const channel = supabase
      .channel(`meus-registros-realtime-${instanceId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'registros', filter: `vendedora_id=eq.${vendedoraId}` },
        refresh,
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [refresh, instanceId, vendedoraId])

  return { registros, loading, error, refresh }
}
