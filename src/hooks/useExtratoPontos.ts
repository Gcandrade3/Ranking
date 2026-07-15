import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { ExtratoPonto } from '@/types/database'

export function useExtratoPontos(vendedoraId: string | null, ano: number, mes: number | null) {
  const [itens, setItens] = useState<ExtratoPonto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!vendedoraId) {
      setItens([])
      return
    }

    let active = true
    setLoading(true)

    let query = supabase
      .from('extrato_pontos')
      .select('*')
      .eq('vendedora_id', vendedoraId)
      .eq('ano', ano)
      .order('mes', { ascending: false })
      .order('data_ocorrencia', { ascending: false, nullsFirst: false })
    if (mes !== null) query = query.eq('mes', mes)

    query.then(({ data, error }) => {
      if (!active) return
      if (error) setError(error.message)
      else {
        setItens(data)
        setError(null)
      }
      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [vendedoraId, ano, mes])

  return { itens, loading, error }
}
