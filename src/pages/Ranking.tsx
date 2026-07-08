import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRanking } from '@/hooks/useRanking'
import { Podio } from '@/components/ranking/Podio'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/lib/auth'

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

export default function RankingPage() {
  const now = new Date()
  const [ano, setAno] = useState(now.getFullYear())
  const [mes, setMes] = useState(now.getMonth() + 1)
  const [periodo, setPeriodo] = useState<'mes' | 'ano'>('mes')
  const { profile } = useAuth()
  const { mensal, anual, loading, error } = useRanking(ano, mes)

  const linhas = periodo === 'mes' ? mensal : anual
  const top3 = linhas.slice(0, 3)
  const resto = linhas.slice(3)

  function mudarMes(delta: number) {
    let novoMes = mes + delta
    let novoAno = ano
    if (novoMes < 1) {
      novoMes = 12
      novoAno -= 1
    } else if (novoMes > 12) {
      novoMes = 1
      novoAno += 1
    }
    setMes(novoMes)
    setAno(novoAno)
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-semibold">Ranking</h1>

      <Tabs value={periodo} onValueChange={(v) => setPeriodo(v as 'mes' | 'ano')}>
        <TabsList>
          <TabsTrigger value="mes">Mês</TabsTrigger>
          <TabsTrigger value="ano">Acumulado do ano</TabsTrigger>
        </TabsList>
      </Tabs>

      {periodo === 'mes' && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => mudarMes(-1)} aria-label="Mês anterior">
            <ChevronLeft className="size-4" />
          </Button>
          <span className="w-40 text-center font-medium">
            {MESES[mes - 1]} de {ano}
          </span>
          <Button variant="ghost" size="icon" onClick={() => mudarMes(1)} aria-label="Próximo mês">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
      {periodo === 'ano' && (
        <p className="mt-4 text-center font-medium text-muted-foreground">Ano de {ano}</p>
      )}

      {error && <p className="mt-4 text-center text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="mt-6 flex flex-col gap-2">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <>
          <Podio top3={top3} />
          <div className="mt-4 flex flex-col gap-2">
            {resto.map((linha, i) => (
              <div
                key={linha.vendedora_id}
                className="flex items-center justify-between rounded-lg border px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center text-sm font-medium text-muted-foreground">
                    {i + 4}º
                  </span>
                  <span
                    className={
                      linha.vendedora_id === profile?.vendedora_id ? 'font-semibold' : undefined
                    }
                  >
                    {linha.nome}
                  </span>
                </div>
                <span className="font-semibold text-brand-600 dark:text-brand-400">
                  {linha.pontos_total} pts
                </span>
              </div>
            ))}
            {linhas.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Ninguém pontuou neste período ainda.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
