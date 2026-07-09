import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AcaoCombobox } from '@/components/registros/AcaoCombobox'
import { cn } from '@/lib/utils'
import type { AcaoCatalogo, Registro, Vendedora } from '@/types/database'
import type { NovoRegistroGestorInput } from '@/hooks/useRegistrosGestor'

interface GestorRegistroFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vendedoras: Vendedora[]
  acoes: AcaoCatalogo[]
  registro?: Registro | null
  onSubmit: (input: NovoRegistroGestorInput) => Promise<{ error: string | null }>
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function GestorRegistroFormDialog({
  open,
  onOpenChange,
  vendedoras,
  acoes,
  registro,
  onSubmit,
}: GestorRegistroFormDialogProps) {
  const [vendedoraId, setVendedoraId] = useState('')
  const [acaoId, setAcaoId] = useState('')
  const [quantidade, setQuantidade] = useState('1')
  const [cliente, setCliente] = useState('')
  const [observacao, setObservacao] = useState('')
  const [dataOcorrencia, setDataOcorrencia] = useState(today())
  const [comprovante, setComprovante] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setVendedoraId(registro?.vendedora_id ?? '')
      setAcaoId(registro?.acao_id ?? '')
      setQuantidade(registro ? String(registro.quantidade) : '1')
      setCliente(registro?.cliente ?? '')
      setObservacao(registro?.observacao ?? '')
      setDataOcorrencia(registro?.data_ocorrencia ?? today())
      setComprovante(null)
      setError(null)
    }
  }, [open, registro])

  const acaoSelecionada = acoes.find((a) => a.id === acaoId)
  const pontosPrevistos = useMemo(() => {
    const qtd = Number(quantidade) || 0
    return acaoSelecionada ? qtd * acaoSelecionada.pontos : 0
  }, [acaoSelecionada, quantidade])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!vendedoraId) {
      setError('Escolha uma vendedora.')
      return
    }
    if (!acaoId) {
      setError('Escolha uma ação.')
      return
    }
    setSubmitting(true)
    const { error } = await onSubmit({
      vendedora_id: vendedoraId,
      acao_id: acaoId,
      quantidade: Number(quantidade),
      cliente,
      observacao,
      data_ocorrencia: dataOcorrencia,
      comprovante,
    })
    setSubmitting(false)
    if (error) setError(error)
    else onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{registro ? 'Editar registro' : 'Registrar ação'}</DialogTitle>
            <DialogDescription>
              {registro
                ? 'Os pontos recalculam na hora se você mudar a ação ou a quantidade.'
                : 'Já entra validado e conta pro ranking na hora.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="vendedora">Vendedora</Label>
              <Select value={vendedoraId} onValueChange={(value) => setVendedoraId(value ?? '')}>
                <SelectTrigger id="vendedora" className="w-full">
                  <SelectValue>
                    {(value: string) => vendedoras.find((v) => v.id === value)?.nome ?? 'Escolha uma vendedora'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {vendedoras.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="acao">Ação</Label>
              <AcaoCombobox acoes={acoes} value={acaoId} onChange={setAcaoId} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="quantidade">Quantidade</Label>
                <Input
                  id="quantidade"
                  type="number"
                  min={1}
                  required
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="data">Data</Label>
                <Input
                  id="data"
                  type="date"
                  required
                  value={dataOcorrencia}
                  onChange={(e) => setDataOcorrencia(e.target.value)}
                />
              </div>
            </div>

            {acaoSelecionada && (
              <p
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium',
                  pontosPrevistos < 0
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-brand-50 text-brand-800 dark:bg-brand-950 dark:text-brand-200',
                )}
              >
                {pontosPrevistos < 0
                  ? `Desconta ${Math.abs(pontosPrevistos)} pontos`
                  : `Vale ${pontosPrevistos} pontos`}
              </p>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="cliente">Cliente (opcional)</Label>
              <Input id="cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="observacao">Observação (opcional)</Label>
              <Textarea
                id="observacao"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="comprovante">
                Comprovante {registro?.comprovante_url ? '(já tem um — escolha outro pra trocar)' : '(opcional)'}
              </Label>
              <Input
                id="comprovante"
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setComprovante(e.target.files?.[0] ?? null)}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Salvando…' : registro ? 'Salvar' : 'Registrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
