import { useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useExtratoPontos } from '@/hooks/useExtratoPontos'
import { corPontos } from '@/lib/utils'
import type { RankingLinha } from '@/hooks/useRanking'
import type { ExtratoPonto } from '@/types/database'

const MESES_ABREV = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function formatarData(data: string | null) {
  if (!data) return null
  const [, mes, dia] = data.split('-').map(Number)
  return `${dia} ${MESES_ABREV[mes - 1]}`
}

interface ExtratoDialogProps {
  linha: RankingLinha | null
  ano: number
  mes: number | null
  onOpenChange: (open: boolean) => void
}

export function ExtratoDialog({ linha, ano, mes, onOpenChange }: ExtratoDialogProps) {
  const { itens, loading, error } = useExtratoPontos(linha?.vendedora_id ?? null, ano, mes)

  const grupos = useMemo(() => {
    const porMes = new Map<number, ExtratoPonto[]>()
    for (const item of itens) {
      if (!porMes.has(item.mes)) porMes.set(item.mes, [])
      porMes.get(item.mes)!.push(item)
    }
    return Array.from(porMes.entries()).sort((a, b) => b[0] - a[0])
  }, [itens])

  return (
    <Dialog open={linha !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{linha?.nome}</DialogTitle>
          <DialogDescription>De onde vieram os {linha?.pontos_total} pontos</DialogDescription>
        </DialogHeader>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {loading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {grupos.map(([mesDoGrupo, itensDoMes]) => (
              <div key={mesDoGrupo}>
                {mes === null && (
                  <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    {MESES_ABREV[mesDoGrupo - 1]}
                  </h3>
                )}
                <div className="flex flex-col gap-1.5">
                  {itensDoMes.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-2">
                        {formatarData(item.data_ocorrencia) && (
                          <span className="text-xs text-muted-foreground">
                            {formatarData(item.data_ocorrencia)}
                          </span>
                        )}
                        {item.descricao}
                      </span>
                      <span className={`shrink-0 font-semibold ${corPontos(item.pontos)}`}>
                        {item.pontos > 0 ? '+' : ''}
                        {item.pontos}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {grupos.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nenhum ponto registrado neste período.
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
