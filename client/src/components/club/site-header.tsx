import { useState } from 'react'
import { Menu, Sparkles, X } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

const navLinks = [
  { href: '/event', label: 'Events' },
  { href: '/#perks', label: 'Perks' },
  { href: '/#team', label: 'Team' },
  { href: '/merch', label: 'Merch' },
  { href: '/projects', label: 'Projects' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2" aria-label="Skyline SSA home">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-5" aria-hidden="true" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight">Skyline <span className="text-primary">SSA</span></span>
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {navLinks.map((link) => {
              return (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {!user ? (
            <Link
              to="/login"
              className={cn(buttonVariants({ size: 'lg' }), 'hidden h-10 rounded-full px-5 sm:inline-flex')}
            >
              Join the club
            </Link>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <span className="text-sm font-medium">Hello, {user.name}</span>
              <button onClick={logout} className="text-sm text-muted-foreground hover:text-destructive transition-colors">Logout</button>
            </div>
          )}
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-lg hover:bg-muted md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-border md:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col px-4 py-3">
            {navLinks.map((link) => {
              return (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-3 font-medium hover:bg-muted"
                  >
                    {link.label}
                  </Link>
                </li>
              )
            })}
            <li className="pt-2">
              {!user ? (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className={cn(buttonVariants({ size: 'lg' }), 'h-11 w-full rounded-full')}
                >
                  Join the club
                </Link>
              ) : (
                <div className="flex flex-col gap-2 p-3">
                  <span className="text-sm font-medium">Hello, {user.name}</span>
                  <button onClick={() => { logout(); setOpen(false); }} className="text-sm text-left text-muted-foreground hover:text-destructive">Logout</button>
                </div>
              )}
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
