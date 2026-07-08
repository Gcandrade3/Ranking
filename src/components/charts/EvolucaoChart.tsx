import { useMemo, useRef, useState } from 'react'
import type { SeriePonto, SerieVendedora } from '@/hooks/useEvolucaoAnual'

const MESES_ABREV = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
]

const CHART_COLOR_VARS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

const WIDTH = 640
const HEIGHT = 280
const PADDING = { top: 16, right: 88, bottom: 28, left: 36 }

export function EvolucaoChart({
  data,
  vendedoras,
}: {
  data: SeriePonto[]
  vendedoras: SerieVendedora[]
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const plotWidth = WIDTH - PADDING.left - PADDING.right
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom

  const maxY = useMemo(() => {
    const max = Math.max(
      1,
      ...data.flatMap((p) => vendedoras.map((v) => p.valores[v.id] ?? 0)),
    )
    return Math.ceil((max * 1.15) / 50) * 50
  }, [data, vendedoras])

  function x(i: number) {
    return data.length <= 1 ? PADDING.left : PADDING.left + (i / (data.length - 1)) * plotWidth
  }
  function y(value: number) {
    return PADDING.top + plotHeight - (value / maxY) * plotHeight
  }

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current
    if (!svg || data.length === 0) return
    const rect = svg.getBoundingClientRect()
    const relX = ((e.clientX - rect.left) / rect.width) * WIDTH
    const ratio = data.length <= 1 ? 0 : (relX - PADDING.left) / plotWidth
    const idx = Math.round(ratio * (data.length - 1))
    setHoverIndex(Math.min(data.length - 1, Math.max(0, idx)))
  }

  const gridLines = [0, 0.25, 0.5, 0.75, 1]
  const hovered = hoverIndex !== null ? data[hoverIndex] : null

  // Rótulos diretos no fim de cada linha: quando duas séries empatam (ou ficam
  // perto) no último ponto, os textos colidem — separa verticalmente mantendo
  // um espaço mínimo, na ordem em que os pontos realmente aparecem no eixo Y.
  const last = data[data.length - 1]
  const labelPositions = useMemo(() => {
    const MIN_GAP = 12
    // Reimplementa a fórmula de y() (em vez de chamar a função do escopo do
    // componente) pra depender só de valores estáveis — maxY já está na lista
    // de dependências, então o resultado nunca fica desatualizado.
    const yFor = (value: number) => PADDING.top + plotHeight - (value / maxY) * plotHeight
    const entries = vendedoras
      .map((v, i) => ({
        id: v.id,
        nome: v.nome,
        color: CHART_COLOR_VARS[i % CHART_COLOR_VARS.length],
        cy: last ? yFor(last.valores[v.id] ?? 0) : 0,
        labelY: 0,
      }))
      .sort((a, b) => a.cy - b.cy)

    entries.forEach((entry, i) => {
      entry.labelY = i === 0 ? entry.cy : Math.max(entry.cy, entries[i - 1].labelY + MIN_GAP)
    })

    return entries
  }, [vendedoras, last, maxY, plotHeight])

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1">
        {vendedoras.map((v, i) => (
          <div key={v.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: CHART_COLOR_VARS[i % CHART_COLOR_VARS.length] }}
            />
            {v.nome}
          </div>
        ))}
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full touch-none select-none"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        {gridLines.map((f) => {
          const gy = PADDING.top + plotHeight * (1 - f)
          return (
            <g key={f}>
              <line
                x1={PADDING.left}
                x2={WIDTH - PADDING.right}
                y1={gy}
                y2={gy}
                stroke="var(--border)"
                strokeWidth={1}
              />
              <text x={PADDING.left - 8} y={gy + 3} textAnchor="end" className="fill-muted-foreground text-[9px]">
                {Math.round(maxY * f)}
              </text>
            </g>
          )
        })}

        {data.map((p, i) =>
          i % Math.ceil(data.length / 6 || 1) === 0 ? (
            <text
              key={p.mes}
              x={x(i)}
              y={HEIGHT - 8}
              textAnchor="middle"
              className="fill-muted-foreground text-[9px]"
            >
              {MESES_ABREV[p.mes - 1]}
            </text>
          ) : null,
        )}

        {vendedoras.map((v, i) => {
          const color = CHART_COLOR_VARS[i % CHART_COLOR_VARS.length]
          const points = data.map((p, idx) => `${x(idx)},${y(p.valores[v.id] ?? 0)}`).join(' ')
          return (
            <polyline
              key={v.id}
              points={points}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )
        })}

        {last &&
          labelPositions.map((entry) => (
            <g key={entry.id}>
              <circle
                cx={x(data.length - 1)}
                cy={entry.cy}
                r={4}
                fill={entry.color}
                stroke="var(--card)"
                strokeWidth={2}
              />
              <text
                x={x(data.length - 1) + 8}
                y={entry.labelY + 3}
                className="fill-foreground text-[10px] font-medium"
              >
                {entry.nome}
              </text>
            </g>
          ))}

        {hovered && (
          <line
            x1={x(hoverIndex!)}
            x2={x(hoverIndex!)}
            y1={PADDING.top}
            y2={HEIGHT - PADDING.bottom}
            stroke="var(--muted-foreground)"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        )}
      </svg>

      {hovered && (
        <div className="mt-2 rounded-lg border bg-popover px-3 py-2 text-xs shadow-sm">
          <p className="mb-1 font-medium">{MESES_ABREV[hovered.mes - 1]}</p>
          <div className="flex flex-col gap-0.5">
            {vendedoras.map((v, i) => (
              <div key={v.id} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: CHART_COLOR_VARS[i % CHART_COLOR_VARS.length] }}
                  />
                  {v.nome}
                </span>
                <span className="font-medium">{hovered.valores[v.id] ?? 0} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
