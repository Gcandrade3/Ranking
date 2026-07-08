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
import type { Vendedora } from '@/types/database'
import type { VendedoraInput } from '@/hooks/useVendedoras'

interface VendedoraFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vendedora?: Vendedora | null
  onSubmit: (input: VendedoraInput) => Promise<{ error: string | null }>
}

export function VendedoraFormDialog({
  open,
  onOpenChange,
  vendedora,
  onSubmit,
}: VendedoraFormDialogProps) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setNome(vendedora?.nome ?? '')
      setEmail(vendedora?.email ?? '')
      setError(null)
    }
  }, [open, vendedora])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const { error } = await onSubmit({ nome, email })
    setSubmitting(false)
    if (error) setError(error)
    else onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{vendedora ? 'Editar vendedora' : 'Nova vendedora'}</DialogTitle>
            <DialogDescription>
              {vendedora
                ? 'Atualize os dados da vendedora.'
                : 'O e-mail precisa bater com o usado no cadastro do Supabase Auth dela.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" required value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
