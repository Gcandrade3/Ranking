import { useMemo } from 'react'
import { useAcoesCatalogo } from '@/hooks/useAcoesCatalogo'
import { Skeleton } from '@/components/ui/skeleton'
import { corPontos } from '@/lib/utils'
import type { AcaoCatalogo } from '@/types/database'

const NOME_CATEGORIA: Record<string, string> = {
  prospeccao: 'Prospecção',
  relacionamento: 'Relacionamento',
  venda: 'Venda',
  penalidade: 'Penalidade',
}

export default function Pontuacao() {
  const { acoes, loading, error } = useAcoesCatalogo()

  const grupos = useMemo(() => {
    const ativas = [...acoes].filter((a) => a.ativo).sort((a, b) => a.ordem - b.ordem)
    const mapa = new Map<string, AcaoCatalogo[]>()
    for (const acao of ativas) {
      const chave = acao.categoria ?? 'outros'
      if (!mapa.has(chave)) mapa.set(chave, [])
      mapa.get(chave)!.push(acao)
    }
    return Array.from(mapa.entries())
  }, [acoes])

  return (
    <div className="p-4">
      <h1 className="mb-1 text-2xl font-semibold">De onde vêm os pontos</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Cada ação lançada e validada pelo gestor soma (ou desconta) esses pontos no ranking.
      </p>

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {grupos.map(([categoria, itens]) => (
            <div key={categoria}>
              <h2 className="mb-2 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                {NOME_CATEGORIA[categoria] ?? categoria}
              </h2>
              <div className="flex flex-col gap-2">
                {itens.map((acao) => (
                  <div
                    key={acao.id}
                    className="flex items-center justify-between rounded-lg border px-4 py-3"
                  >
                    <span>{acao.descricao}</span>
                    <span className={`font-semibold ${corPontos(acao.pontos)}`}>
                      {acao.pontos > 0 ? '+' : ''}
                      {acao.pontos}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {grupos.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma ação cadastrada ainda.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
