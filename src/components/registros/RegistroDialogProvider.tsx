import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { useRegistrosGestor } from '@/hooks/useRegistrosGestor'
import { useVendedoras } from '@/hooks/useVendedoras'
import { useAcoesCatalogo } from '@/hooks/useAcoesCatalogo'
import { GestorRegistroFormDialog } from '@/components/registros/GestorRegistroFormDialog'
import { comemorarVendaFechada } from '@/lib/confetti'
import type { Registro } from '@/types/database'

interface RegistroDialogContextValue {
  abrirNovoRegistro: () => void
  abrirEditarRegistro: (registro: Registro) => void
}

const RegistroDialogContext = createContext<RegistroDialogContextValue | null>(null)

export function useRegistroDialog() {
  const ctx = useContext(RegistroDialogContext)
  if (!ctx) {
    throw new Error('useRegistroDialog precisa estar dentro de RegistroDialogProvider')
  }
  return ctx
}

// Vive no layout do gestor (não dentro de cada página) justamente pra
// sobreviver à troca de aba — antes, trocar de página com o diálogo aberto
// desmontava o formulário e perdia tudo que a pessoa tinha digitado.
export function RegistroDialogProvider({ children }: { children: ReactNode }) {
  const { criarRegistro, atualizarRegistro } = useRegistrosGestor()
  const { vendedoras } = useVendedoras()
  const { acoes } = useAcoesCatalogo()
  const [open, setOpen] = useState(false)
  const [editando, setEditando] = useState<Registro | null>(null)
  const [dirty, setDirty] = useState(false)

  const vendedoraPorId = useMemo(() => new Map(vendedoras.map((v) => [v.id, v])), [vendedoras])
  const acaoPorId = useMemo(() => new Map(acoes.map((a) => [a.id, a])), [acoes])

  const vendedorasParaDialog = useMemo(() => {
    const ativas = vendedoras.filter((v) => v.ativo)
    if (editando && !ativas.some((v) => v.id === editando.vendedora_id)) {
      const atual = vendedoraPorId.get(editando.vendedora_id)
      if (atual) return [...ativas, atual]
    }
    return ativas
  }, [vendedoras, editando, vendedoraPorId])

  const acoesParaDialog = useMemo(() => {
    const ativas = acoes.filter((a) => a.ativo)
    if (editando && !ativas.some((a) => a.id === editando.acao_id)) {
      const atual = acaoPorId.get(editando.acao_id)
      if (atual) return [...ativas, atual]
    }
    return ativas
  }, [acoes, editando, acaoPorId])

  // Cobre o caso de fechar a aba / dar F5 com o formulário aberto e sujo —
  // a navegação entre abas do próprio app já é coberta por este provider
  // não desmontar, mas isso aqui é o navegador, não o React Router.
  useEffect(() => {
    if (!open || !dirty) return
    function handler(e: BeforeUnloadEvent) {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [open, dirty])

  function abrirNovoRegistro() {
    setEditando(null)
    setDirty(false)
    setOpen(true)
  }

  function abrirEditarRegistro(registro: Registro) {
    setEditando(registro)
    setDirty(false)
    setOpen(true)
  }

  async function handleSubmit(input: Parameters<typeof criarRegistro>[0]) {
    const result = editando
      ? await atualizarRegistro(editando.id, input)
      : await criarRegistro(input)
    if (!result.error) {
      toast.success(editando ? 'Registro atualizado!' : 'Ação registrada e validada!')
      if (!editando && acaoPorId.get(input.acao_id)?.descricao.startsWith('Venda Fechada')) {
        comemorarVendaFechada()
      }
    }
    return result
  }

  return (
    <RegistroDialogContext.Provider value={{ abrirNovoRegistro, abrirEditarRegistro }}>
      {children}
      <GestorRegistroFormDialog
        open={open}
        onOpenChange={setOpen}
        vendedoras={vendedorasParaDialog}
        acoes={acoesParaDialog}
        registro={editando}
        onSubmit={handleSubmit}
        onDirtyChange={setDirty}
      />
    </RegistroDialogContext.Provider>
  )
}
