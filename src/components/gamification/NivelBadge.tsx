import { CloudSun, Flame, Sparkles, Star, Sun, Zap, type LucideIcon } from 'lucide-react'
import { getProgresso } from '@/lib/niveis'
import { Progress } from '@/components/ui/progress'
import type { NivelIcone } from '@/lib/niveis'

const ICONES: Record<NivelIcone, LucideIcon> = {
  sparkles: Sparkles,
  flame: Flame,
  zap: Zap,
  'cloud-sun': CloudSun,
  sun: Sun,
  star: Star,
}

export function NivelBadge({ pontos }: { pontos: number }) {
  const { nivel, proximo, percentual, faltam } = getProgresso(pontos)
  const Icone = ICONES[nivel.icone]

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
          <Icone className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Nível {nivel.nome}</p>
          <p className="text-xs text-muted-foreground">
            {proximo
              ? `Faltam ${faltam} pts para o nível ${proximo.nome}`
              : 'Nível máximo alcançado'}
          </p>
        </div>
      </div>
      <Progress value={percentual} className="mt-3" />
    </div>
  )
}
