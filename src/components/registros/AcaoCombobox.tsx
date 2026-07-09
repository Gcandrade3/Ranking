import { useMemo, useState } from 'react'
import { ChevronsUpDown } from 'lucide-react'
import { cn, corPontos } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import type { AcaoCatalogo } from '@/types/database'

function rotuloCategoria(categoria: string | null) {
  if (!categoria) return 'Outras'
  return categoria.charAt(0).toUpperCase() + categoria.slice(1)
}

interface AcaoComboboxProps {
  acoes: AcaoCatalogo[]
  value: string
  onChange: (id: string) => void
}

export function AcaoCombobox({ acoes, value, onChange }: AcaoComboboxProps) {
  const [open, setOpen] = useState(false)
  const selecionada = acoes.find((a) => a.id === value)

  const grupos = useMemo(() => {
    const porCategoria = new Map<string, AcaoCatalogo[]>()
    for (const acao of acoes) {
      const rotulo = rotuloCategoria(acao.categoria)
      if (!porCategoria.has(rotulo)) porCategoria.set(rotulo, [])
      porCategoria.get(rotulo)!.push(acao)
    }
    return Array.from(porCategoria.entries()).sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))
  }, [acoes])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            {selecionada ? (
              <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                <span className="truncate">{selecionada.descricao}</span>
                <span className={cn('shrink-0 text-xs font-semibold', corPontos(selecionada.pontos))}>
                  {selecionada.pontos} pts
                </span>
              </span>
            ) : (
              <span className="text-muted-foreground">Escolha uma ação</span>
            )}
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        }
      />
      <PopoverContent align="start" className="w-(--anchor-width) p-0">
        <Command>
          <CommandInput placeholder="Buscar ação…" />
          <CommandList>
            <CommandEmpty>Nenhuma ação encontrada.</CommandEmpty>
            {grupos.map(([rotulo, itens]) => (
              <CommandGroup key={rotulo} heading={rotulo}>
                {itens.map((acao) => (
                  <CommandItem
                    key={acao.id}
                    value={`${acao.descricao} ${rotulo}`}
                    onSelect={() => {
                      onChange(acao.id)
                      setOpen(false)
                    }}
                  >
                    <span className="flex-1 truncate">{acao.descricao}</span>
                    <span className={cn('shrink-0 text-xs font-semibold', corPontos(acao.pontos))}>
                      {acao.pontos} pts
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
