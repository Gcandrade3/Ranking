import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Pontos negativos (ações que descontam) usam a cor de destrutivo em vez da
// cor de marca, pra não parecerem um ganho.
export function corPontos(pontos: number) {
  return pontos < 0 ? 'text-destructive' : 'text-brand-600 dark:text-brand-400'
}
