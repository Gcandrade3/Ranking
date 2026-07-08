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
import type { AcaoCatalogo } from '@/types/database'
import type { RegistroInput } from '@/hooks/useRegistros'

interface RegistroFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  acoes: AcaoCatalogo[]
  onSubmit: (input: RegistroInput) => Promise<{ error: string | null }>
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function RegistroFormDialog({
  open,
  onOpenChange,
  acoes,
  onSubmit,
}: RegistroFormDialogProps) {
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
      setAcaoId('')
      setQuantidade('1')
      setCliente('')
      setObservacao('')
      setDataOcorrencia(today())
      setComprovante(null)
      setError(null)
    }
  }, [open])

  const acaoSelecionada = acoes.find((a) => a.id === acaoId)
  const pontosPrevistos = useMemo(() => {
    const qtd = Number(quantidade) || 0
    return acaoSelecionada ? qtd * acaoSelecionada.pontos : 0
  }, [acaoSelecionada, quantidade])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!acaoId) {
      setError('Escolha uma ação.')
      return
    }
    setSubmitting(true)
    const { error } = await onSubmit({
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
            <DialogTitle>Registrar ação</DialogTitle>
            <DialogDescription>
              Fica pendente até o gestor validar — só então entra no ranking.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="acao">Ação</Label>
              <Select value={acaoId} onValueChange={(value) => setAcaoId(value ?? '')}>
                <SelectTrigger id="acao" className="w-full">
                  {/* SelectValue não deriva o rótulo do texto filho do SelectItem — só
                      resolve por uma prop `items` declarativa que não usamos aqui, então
                      mapeamos manualmente o id selecionado de volta para o texto. */}
                  <SelectValue>
                    {(value: string) => {
                      const acao = acoes.find((a) => a.id === value)
                      return acao ? `${acao.descricao} · ${acao.pontos} pts` : 'Escolha uma ação'
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {acoes.map((acao) => (
                    <SelectItem key={acao.id} value={acao.id}>
                      {acao.descricao} · {acao.pontos} pts
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm font-medium text-brand-800 dark:bg-brand-950 dark:text-brand-200">
                Vale {pontosPrevistos} pontos
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
              <Label htmlFor="comprovante">Comprovante (opcional)</Label>
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
              {submitting ? 'Enviando…' : 'Registrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
