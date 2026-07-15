import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types/database'

interface AuthContextValue {
  session: Session | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    // Rastreado fora do estado React: só precisamos saber se o usuário logado
    // mudou entre um evento de auth e o próximo, não precisamos re-renderizar
    // por causa dele.
    let currentUserId: string | null = null

    async function loadProfile(userId: string) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (!active) return
      if (error) {
        console.error('Falha ao carregar profile:', error.message)
        setProfile(null)
      } else {
        setProfile(data)
      }
    }

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      setSession(data.session)
      currentUserId = data.session?.user.id ?? null
      if (data.session) await loadProfile(data.session.user.id)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!active) return
        setSession(newSession)

        // O Supabase dispara este evento também para renovação silenciosa de
        // token (ex.: toda vez que a aba volta a ficar visível) — sem isso, a
        // tela inteira piscava para "Carregando…" a cada volta ao navegador,
        // mesmo com o mesmo usuário já logado. Só refazemos o carregamento do
        // profile quando o usuário logado de fato muda (login/logout/troca de conta).
        const newUserId = newSession?.user.id ?? null
        if (newUserId === currentUserId) return
        currentUserId = newUserId

        // loading volta a true até o profile carregar junto — senão há uma
        // janela em que session já está setada mas profile ainda é o valor
        // antigo (null), e telas que decidem rota por profile.papel agem cedo demais.
        setLoading(true)
        if (newSession) {
          await loadProfile(newSession.user.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      },
    )

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}
