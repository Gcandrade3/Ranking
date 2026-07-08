import { Crown } from 'lucide-react'
import { useRanking } from '@/hooks/useRanking'

const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]

export function VendedoraDoMes() {
  const now = new Date()
  const { mensal, loading } = useRanking(now.getFullYear(), now.getMonth() + 1)
  const lider = mensal[0]

  if (loading || !lider || lider.pontos_total <= 0) return null

  return (
    <div className="mb-4 flex items-center gap-3 rounded-lg bg-gradient-to-r from-brand-500 to-brand-400 px-4 py-3 text-primary-foreground">
      <Crown className="size-6 shrink-0" />
      <p className="text-sm">
        <span className="font-semibold">{lider.nome}</span> é a vendedora do mês de{' '}
        {MESES[now.getMonth()]}, com {lider.pontos_total} pontos!
      </p>
    </div>
  )
}
