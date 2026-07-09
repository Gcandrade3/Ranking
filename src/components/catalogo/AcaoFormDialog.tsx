import { useEffect, useState, type FormEvent } from 'react'
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
import type { AcaoCatalogo } from '@/types/database'
import type { AcaoCatalogoInput } from '@/hooks/useAcoesCatalogo'

interface AcaoFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  acao?: AcaoCatalogo | null
  onSubmit: (input: AcaoCatalogoInput) => Promise<{ error: string | null }>
}

export function AcaoFormDialog({ open, onOpenChange, acao, onSubmit }: AcaoFormDialogProps) {
  const [descricao, setDescricao] = useState('')
  const [pontos, setPontos] = useState('')
  const [categoria, setCategoria] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setDescricao(acao?.descricao ?? '')
      setPontos(acao ? String(acao.pontos) : '')
      setCategoria(acao?.categoria ?? '')
      setError(null)
    }
  }, [open, acao])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const { error } = await onSubmit({
      descricao,
      pontos: Number(pontos),
      categoria: categoria || null,
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
            <DialogTitle>{acao ? 'Editar ação' : 'Nova ação'}</DialogTitle>
            <DialogDescription>
              Pontos já lançados não mudam retroativamente se você editar o valor aqui. Use um
              valor negativo pra ações que descontam pontos (ex.: cancelamento).
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                required
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="pontos">Pontos</Label>
              <Input
                id="pontos"
                type="number"
                required
                value={pontos}
                onChange={(e) => setPontos(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Input
                id="categoria"
                placeholder="prospeccao, relacionamento, venda…"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Salvando…' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
