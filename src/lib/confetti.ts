import confetti from 'canvas-confetti'

const BRAND_COLORS = ['#f2af2d', '#f6b131', '#16a34a', '#fff8eb']

export function comemorarVendaFechada() {
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    colors: BRAND_COLORS,
  })
}
