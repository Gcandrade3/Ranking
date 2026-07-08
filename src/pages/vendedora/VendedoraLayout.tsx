import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'

const links = [
  { to: '/app', label: 'Início', end: true },
  { to: '/app/ranking', label: 'Ranking' },
]

export default function VendedoraLayout() {
  return (
    <div>
      <nav className="flex gap-1 overflow-x-auto border-b px-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              cn(
                'whitespace-nowrap border-b-2 border-transparent px-3 py-3 text-sm font-medium text-muted-foreground transition-colors',
                isActive && 'border-primary text-foreground',
              )
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}
