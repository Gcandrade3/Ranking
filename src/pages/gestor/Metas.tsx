import { useMemo, useState } from 'react'
import { useMetasMensais } from '@/hooks/useMetasMensais'
import { useVendedoras } from '@/hooks/useVendedoras'
import { MetaDialog } from '@/components/metas/MetaDialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import type { MetaMensal } from '@/types/database'

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

export default function GestorMetas() {
  const ano = new Date().getFullYear()
  const { metas, loading, error, updateMeta } = useMetasMensais(ano)
  const { vendedoras } = useVendedoras()
  const vendedorasAtivas = useMemo(() => vendedoras.filter((v) => v.ativo), [vendedoras])
  const [selecionada, setSelecionada] = useState<MetaMensal | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  function abrir(meta: MetaMensal) {
    setSelecionada(meta)
    setDialogOpen(true)
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-semibold">Metas de {ano}</h1>

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {metas.map((meta) => (
            <button
              key={meta.id}
              onClick={() => abrir(meta)}
              className="flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors hover:bg-accent"
            >
              <div>
                <p className="font-medium">{MESES[meta.mes - 1]}</p>
                <Badge variant="outline" className="mt-1">
                  {meta.descricao_meta}
                </Badge>
              </div>
              <span className="font-semibold text-brand-600 dark:text-brand-400">
                +{meta.pontos_bonus} pts
              </span>
            </button>
          ))}
        </div>
      )}

      <MetaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        meta={selecionada}
        vendedorasAtivas={vendedorasAtivas}
        onUpdateMeta={updateMeta}
      />
    </div>
  )
}
