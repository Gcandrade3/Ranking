import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
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
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { useMetasAtingidas } from '@/hooks/useMetasAtingidas'
import type { MetaMensal, Vendedora } from '@/types/database'
import type { MetaMensalInput } from '@/hooks/useMetasMensais'

const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

interface MetaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  meta: MetaMensal | null
  vendedorasAtivas: Vendedora[]
  onUpdateMeta: (id: string, input: Partial<MetaMensalInput>) => Promise<{ error: string | null }>
}

export function MetaDialog({
  open,
  onOpenChange,
  meta,
  vendedorasAtivas,
  onUpdateMeta,
}: MetaDialogProps) {
  const [descricao, setDescricao] = useState('')
  const [bonus, setBonus] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { vendedoraIds, loading: loadingAtingidas, toggle } = useMetasAtingidas(meta?.id ?? null)

  useEffect(() => {
    if (open && meta) {
      setDescricao(meta.descricao_meta)
      setBonus(String(meta.pontos_bonus))
      setError(null)
    }
  }, [open, meta])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!meta) return
    setSubmitting(true)
    const { error } = await onUpdateMeta(meta.id, {
      descricao_meta: descricao,
      pontos_bonus: Number(bonus),
    })
    setSubmitting(false)
    if (error) setError(error)
    else toast.success('Meta atualizada.')
  }

  async function handleToggle(vendedoraId: string, atingiu: boolean) {
    const { error } = await toggle(vendedoraId, atingiu)
    if (error) toast.error(error)
  }

  if (!meta) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {MESES[meta.mes - 1]} de {meta.ano}
          </DialogTitle>
          <DialogDescription>
            Quem bater a meta ganha o bônus somado ao total do mês.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="descricao">Meta</Label>
              <Input
                id="descricao"
                required
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="bonus">Bônus (pts)</Label>
              <Input
                id="bonus"
                type="number"
                min={1}
                required
                value={bonus}
                onChange={(e) => setBonus(e.target.value)}
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={submitting} size="sm" className="self-end">
            {submitting ? 'Salvando…' : 'Salvar meta'}
          </Button>
        </form>

        <Separator />

        <div>
          <p className="mb-2 text-sm font-medium">Quem bateu a meta?</p>
          <div className="flex flex-col gap-1">
            {vendedorasAtivas.map((v) => (
              <div key={v.id} className="flex items-center justify-between py-1.5">
                <span className="text-sm">{v.nome}</span>
                <Switch
                  disabled={loadingAtingidas}
                  checked={vendedoraIds.has(v.id)}
                  onCheckedChange={(checked) => handleToggle(v.id, checked)}
                />
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
