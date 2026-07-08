import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useTheme } from '@/lib/theme'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Login() {
  const { session, signIn, loading } = useAuth()
  const { theme, toggle } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && session) return <Navigate to="/" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error } = await signIn(email, password)
    setSubmitting(false)
    if (error) setError('E-mail ou senha inválidos.')
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-50 to-background px-4 dark:from-background dark:to-background">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggle}
        aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
        className="absolute top-4 right-4"
      >
        {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </Button>
      <Card className="w-full max-w-sm border-brand-100 dark:border-border">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-brand-500 text-primary-foreground">
            <Sun className="size-6" />
          </div>
          <CardTitle className="text-xl">Reconluz Premia</CardTitle>
          <CardDescription>Entre para ver seus pontos e o ranking</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={submitting} className="mt-2">
              {submitting ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
