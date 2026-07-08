import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useVendedoras } from '@/hooks/useVendedoras'
import { VendedoraFormDialog } from '@/components/vendedoras/VendedoraFormDialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Vendedora } from '@/types/database'

export default function GestorVendedoras() {
  const { vendedoras, loading, error, createVendedora, updateVendedora, toggleAtivo } =
    useVendedoras()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Vendedora | null>(null)

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(vendedora: Vendedora) {
    setEditing(vendedora)
    setDialogOpen(true)
  }

  async function handleSubmit(input: { nome: string; email: string }) {
    const result = editing ? await updateVendedora(editing.id, input) : await createVendedora(input)
    if (!result.error) toast.success(editing ? 'Vendedora atualizada.' : 'Vendedora criada.')
    return result
  }

  async function handleToggle(vendedora: Vendedora) {
    const { error } = await toggleAtivo(vendedora.id, !vendedora.ativo)
    if (error) toast.error(error)
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Vendedoras</h1>
        <Button onClick={openCreate} size="sm">
          <Plus className="size-4" />
          Nova
        </Button>
      </div>

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ativa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendedoras.map((vendedora) => (
                <TableRow
                  key={vendedora.id}
                  className="cursor-pointer"
                  onClick={() => openEdit(vendedora)}
                >
                  <TableCell className="font-medium">{vendedora.nome}</TableCell>
                  <TableCell
                    className="max-w-[140px] truncate text-muted-foreground"
                    title={vendedora.email}
                  >
                    {vendedora.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={vendedora.ativo ? 'default' : 'secondary'}>
                      {vendedora.ativo ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Switch
                      checked={vendedora.ativo}
                      onCheckedChange={() => handleToggle(vendedora)}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {vendedoras.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Nenhuma vendedora cadastrada ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <VendedoraFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        vendedora={editing}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
