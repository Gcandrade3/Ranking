export type NivelIcone = 'sparkles' | 'flame' | 'zap' | 'cloud-sun' | 'sun' | 'star'

export interface Nivel {
  nome: string
  min: number
  max: number | null
  icone: NivelIcone
}

// Faixas de pontos acumulados no ano — temática solar, alinhada com a marca Reconluz.
export const NIVEIS: Nivel[] = [
  { nome: 'Faísca', min: 0, max: 499, icone: 'sparkles' },
  { nome: 'Brasa', min: 500, max: 1499, icone: 'flame' },
  { nome: 'Chama', min: 1500, max: 2999, icone: 'zap' },
  { nome: 'Fogueira', min: 3000, max: 4999, icone: 'cloud-sun' },
  { nome: 'Sol', min: 5000, max: 7999, icone: 'sun' },
  { nome: 'Supernova', min: 8000, max: null, icone: 'star' },
]

export function getNivel(pontos: number): Nivel {
  return NIVEIS.find((n) => pontos >= n.min && (n.max === null || pontos <= n.max)) ?? NIVEIS[0]
}

export function getProgresso(pontos: number) {
  const nivel = getNivel(pontos)
  const proximo = NIVEIS[NIVEIS.indexOf(nivel) + 1] ?? null
  if (!proximo) return { nivel, proximo: null, percentual: 100, faltam: 0 }
  const percentual = Math.min(
    100,
    Math.round(((pontos - nivel.min) / (proximo.min - nivel.min)) * 100),
  )
  return { nivel, proximo, percentual, faltam: proximo.min - pontos }
}
