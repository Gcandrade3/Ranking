import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useAcoesCatalogo } from '@/hooks/useAcoesCatalogo'
import { AcaoFormDialog } from '@/components/catalogo/AcaoFormDialog'
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
import { corPontos } from '@/lib/utils'
import type { AcaoCatalogo } from '@/types/database'

export default function GestorCatalogo() {
  const { acoes, loading, error, createAcao, updateAcao, toggleAtivo } = useAcoesCatalogo()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AcaoCatalogo | null>(null)

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(acao: AcaoCatalogo) {
    setEditing(acao)
    setDialogOpen(true)
  }

  async function handleSubmit(input: {
    descricao: string
    pontos: number
    categoria?: string | null
    ordem?: number
  }) {
    const result = editing ? await updateAcao(editing.id, input) : await createAcao(input)
    if (!result.error) toast.success(editing ? 'Ação atualizada.' : 'Ação criada.')
    return result
  }

  async function handleToggle(acao: AcaoCatalogo) {
    const { error } = await toggleAtivo(acao.id, !acao.ativo)
    if (error) toast.error(error)
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Catálogo de ações</h1>
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
                <TableHead>Ação</TableHead>
                <TableHead>Pontos</TableHead>
                <TableHead className="text-right">Ativa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {acoes.map((acao) => (
                <TableRow key={acao.id} className="cursor-pointer" onClick={() => openEdit(acao)}>
                  <TableCell>
                    <div className="font-medium">{acao.descricao}</div>
                    {acao.categoria && (
                      <Badge variant="outline" className="mt-1">
                        {acao.categoria}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className={`font-semibold ${corPontos(acao.pontos)}`}>
                    {acao.pontos}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Switch checked={acao.ativo} onCheckedChange={() => handleToggle(acao)} />
                  </TableCell>
                </TableRow>
              ))}
              {acoes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Nenhuma ação cadastrada ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <AcaoFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        acao={editing}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
