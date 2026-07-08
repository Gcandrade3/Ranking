import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { StatusRegistro } from '@/types/database'

const labels: Record<StatusRegistro, string> = {
  pendente: 'Pendente',
  validado: 'Validado',
  rejeitado: 'Rejeitado',
}

const styles: Record<StatusRegistro, string> = {
  pendente: 'bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-200',
  validado: 'bg-success-100 text-success-800 dark:bg-success-950 dark:text-success-200',
  rejeitado: 'bg-destructive/10 text-destructive dark:bg-destructive/20',
}

export function StatusBadge({ status }: { status: StatusRegistro }) {
  return <Badge className={cn('border-0', styles[status])}>{labels[status]}</Badge>
}
