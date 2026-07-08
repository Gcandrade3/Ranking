import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, Paperclip } from 'lucide-react'
import { useRegistrosGestor } from '@/hooks/useRegistrosGestor'
import { useVendedoras } from '@/hooks/useVendedoras'
import { useAcoesCatalogo } from '@/hooks/useAcoesCatalogo'
import { GestorRegistroFormDialog } from '@/components/registros/GestorRegistroFormDialog'
import { StatusBadge } from '@/components/registros/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { comemorarVendaFechada } from '@/lib/confetti'

export default function GestorRegistros() {
  const { registros, loading, error, criarRegistro, excluir } = useRegistrosGestor()
  const { vendedoras } = useVendedoras()
  const { acoes } = useAcoesCatalogo()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filtroVendedora, setFiltroVendedora] = useState('todas')

  const vendedoraPorId = useMemo(() => new Map(vendedoras.map((v) => [v.id, v])), [vendedoras])
  const acaoPorId = useMemo(() => new Map(acoes.map((a) => [a.id, a])), [acoes])
  const vendedorasAtivas = useMemo(() => vendedoras.filter((v) => v.ativo), [vendedoras])

  const registrosFiltrados = useMemo(
    () =>
      filtroVendedora === 'todas'
        ? registros
        : registros.filter((r) => r.vendedora_id === filtroVendedora),
    [registros, filtroVendedora],
  )

  async function handleSubmit(input: Parameters<typeof criarRegistro>[0]) {
    const result = await criarRegistro(input)
    if (!result.error) {
      toast.success('Ação registrada e validada!')
      if (acaoPorId.get(input.acao_id)?.descricao.startsWith('Venda Fechada')) {
        comemorarVendaFechada()
      }
    }
    return result
  }

  async function handleExcluir(id: string) {
    const { error } = await excluir(id)
    if (error) toast.error(error)
    else toast('Registro excluído.')
  }

  async function verComprovante(path: string) {
    const { data, error } = await supabase.storage.from('comprovantes').createSignedUrl(path, 60)
    if (error || !data) {
      toast.error('Não foi possível abrir o comprovante.')
      return
    }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Registros</h1>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" />
          Registrar
        </Button>
      </div>

      <div className="mb-4">
        <Select value={filtroVendedora} onValueChange={(v) => setFiltroVendedora(v ?? 'todas')}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue>
              {(value: string) =>
                value === 'todas' ? 'Todas as vendedoras' : (vendedoraPorId.get(value)?.nome ?? '')
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as vendedoras</SelectItem>
            {vendedoras.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {registrosFiltrados.map((registro) => {
            const vendedora = vendedoraPorId.get(registro.vendedora_id)
            const acao = acaoPorId.get(registro.acao_id)
            return (
              <Card key={registro.id}>
                <CardContent className="flex flex-col gap-2 px-4 py-3">
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
                    <div className="flex flex-col items-end gap-1">
                      <span className="whitespace-nowrap font-semibold text-brand-600 dark:text-brand-400">
                        {registro.pontos_calculados} pts
                      </span>
                      <StatusBadge status={registro.status} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleExcluir(registro.id)}
                    >
                      <Trash2 className="size-4" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
          {registrosFiltrados.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum registro ainda.
            </p>
          )}
        </div>
      )}

      <GestorRegistroFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        vendedoras={vendedorasAtivas}
        acoes={acoes.filter((a) => a.ativo)}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
