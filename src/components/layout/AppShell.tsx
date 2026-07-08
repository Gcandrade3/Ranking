import type { ReactNode } from 'react'
import { LogOut, Moon, Sun } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useTheme } from '@/lib/theme'
import { Button } from '@/components/ui/button'

export function AppShell({ children }: { children: ReactNode }) {
  const { signOut } = useAuth()
  const { theme, toggle } = useTheme()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 font-semibold">
            <span className="flex size-8 items-center justify-center rounded-full bg-brand-500 text-primary-foreground">
              <Sun className="size-4" />
            </span>
            Reconluz Premia
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
            >
              {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sair">
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1">{children}</main>
    </div>
  )
}
