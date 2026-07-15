import type { RankingLinhaComEvolucao } from '@/hooks/useRanking'

interface InsightsProps {
  linhas: RankingLinhaComEvolucao[]
  meuVendedoraId: string | null
  periodo: 'mes' | 'ano'
}

export function Insights({ linhas, meuVendedoraId, periodo }: InsightsProps) {
  const minha = linhas.find((l) => l.vendedora_id === meuVendedoraId)
  const maiorCrescimento = [...linhas].sort((a, b) => b.deltaPontos - a.deltaPontos)[0]
  const itens: string[] = []

  if (minha) {
    if (minha.deltaPontos > 0) {
      itens.push(
        `🔥 Você ganhou ${minha.deltaPontos} pontos ${periodo === 'mes' ? 'este mês' : 'este ano'}.`,
      )
    }
    if (minha.posicao > 3 && linhas[2]) {
      itens.push(`🎯 Faltam ${linhas[2].pontos_total - minha.pontos_total} pontos para entrar no Top 3.`)
    }
    if (maiorCrescimento?.vendedora_id === minha.vendedora_id && minha.deltaPontos > 0) {
      itens.push('🚀 Você foi quem mais cresceu neste período!')
    }
    if (minha.posicao === 1) {
      itens.push('⭐ Continue nesse ritmo para manter a liderança.')
    } else {
      const acima = linhas[minha.posicao - 2]
      if (acima) itens.push(`⭐ Continue nesse ritmo para ultrapassar ${acima.nome}.`)
    }
  } else {
    if (linhas[0]) itens.push(`⭐ ${linhas[0].nome} lidera com ${linhas[0].pontos_total} pontos.`)
    if (maiorCrescimento && maiorCrescimento.deltaPontos > 0) {
      itens.push(`🚀 ${maiorCrescimento.nome} foi quem mais cresceu neste período.`)
    }
  }

  if (itens.length === 0) return null

  return (
    <div className="rounded-xl border p-4">
      <h2 className="mb-3 text-sm font-semibold">Insights</h2>
      <ul className="flex flex-col gap-2">
        {itens.slice(0, 4).map((texto) => (
          <li key={texto} className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
            {texto}
          </li>
        ))}
      </ul>
    </div>
  )
}
