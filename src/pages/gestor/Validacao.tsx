import { useMemo } from 'react'
import { toast } from 'sonner'
import { Check, Paperclip, X } from 'lucide-react'
import { useFilaValidacao } from '@/hooks/useFilaValidacao'
import { useVendedoras } from '@/hooks/useVendedoras'
import { useAcoesCatalogo } from '@/hooks/useAcoesCatalogo'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { comemorarVendaFechada } from '@/lib/confetti'

export default function GestorValidacao() {
  const { registros, loading, error, validar, rejeitar } = useFilaValidacao()
  const { vendedoras } = useVendedoras()
  const { acoes } = useAcoesCatalogo()

  const vendedoraPorId = useMemo(() => new Map(vendedoras.map((v) => [v.id, v])), [vendedoras])
  const acaoPorId = useMemo(() => new Map(acoes.map((a) => [a.id, a])), [acoes])

  async function handleValidar(id: string, acaoId: string) {
    const { error } = await validar(id)
    if (error) {
      toast.error(error)
      return
    }
    toast.success('Registro validado! Pontos entraram no ranking.')
    if (acaoPorId.get(acaoId)?.descricao.startsWith('Venda Fechada')) {
      comemorarVendaFechada()
    }
  }

  async function handleRejeitar(id: string) {
    const { error } = await rejeitar(id)
    if (error) toast.error(error)
    else toast('Registro rejeitado.')
  }

  async function verComprovante(path: string) {
    const { data, error } = await supabase.storage
      .from('comprovantes')
      .createSignedUrl(path, 60)
    if (error || !data) {
      toast.error('Não foi possível abrir o comprovante.')
      return
    }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-semibold">Fila de validação</h1>

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {registros.map((registro) => {
            const vendedora = vendedoraPorId.get(registro.vendedora_id)
            const acao = acaoPorId.get(registro.acao_id)
            return (
              <Card key={registro.id}>
                <CardContent className="flex flex-col gap-3 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{vendedora?.nome ?? 'Vendedora'}</p>
                      <p className="text-sm text-muted-foreground">
                        {acao?.descricao ?? 'Ação'} · {registro.quantidade}x ·{' '}
                        {new Date(registro.data_ocorrencia + 'T00:00:00').toLocaleDateString(
                          'pt-BR',
                        )}
                      </p>
                      {registro.cliente && (
                        <p className="mt-1 text-sm">
                          Cliente: <span className="font-medium">{registro.cliente}</span>
                        </p>
                      )}
                      {registro.observacao && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {registro.observacao}
                        </p>
                      )}
                    </div>
                    <span className="whitespace-nowrap font-semibold text-brand-600 dark:text-brand-400">
                      {registro.pontos_calculados} pts
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    {registro.comprovante_url ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => verComprovante(registro.comprovante_url!)}
                      >
                        <Paperclip className="size-4" />
                        Comprovante
                      </Button>
                    ) : (
                      <span />
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRejeitar(registro.id)}
                      >
                        <X className="size-4" />
                        Rejeitar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleValidar(registro.id, registro.acao_id)}
                      >
                        <Check className="size-4" />
                        Validar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
          {registros.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum registro pendente. Tudo validado!
            </p>
          )}
        </div>
      )}
    </div>
  )
}
