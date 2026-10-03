import { useState } from 'react'
import { Menu, X, LogOut, User } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

const baseNavLinks = [
  { href: '/', label: 'Home' },
  { href: '/events', label: 'Events' },
  { href: '/merch', label: 'Merch' },
  { href: '/announcements', label: 'Bulletin' },
  { href: '/perks', label: 'Perks' },
  { href: '/team', label: 'Team' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const { user, logout, canScan, canAccessTreasury, canSubmitExpenses, isOfficer } = useAuth()

  const navLinks = [
    ...baseNavLinks,
    ...(user ? [
      { href: '/projects', label: 'Projects' },
      { href: '/tickets', label: 'My Tickets' },
      { href: '/volunteering', label: 'My Volunteering' },
      { href: '/expenses/my', label: 'My Claims' },
      { href: '/orders', label: 'My Orders' },
    ] : []),
    ...(canSubmitExpenses ? [
      { href: '/expenses/submit', label: 'Submit Expense' },
    ] : []),
    ...(canScan ? [
      { href: '/admin/scanner', label: 'Scanner' },
    ] : []),
    ...(canAccessTreasury ? [
      { href: '/admin/treasury', label: 'Treasury' },
      { href: '/admin/expenses', label: 'Claims' },
    ] : []),
    ...(isOfficer ? [
      { href: '/admin/members', label: 'Members' },
      { href: '/admin/orders', label: 'Orders Queue' },
      { href: '/admin/inventory', label: 'Inventory' },
    ] : []),
  ]
  const primaryNavLinks = navLinks.slice(0, baseNavLinks.length)
  const workspaceLinks = navLinks.slice(baseNavLinks.length)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="flex min-h-16 w-full items-center justify-between gap-3 px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2" aria-label="Skyline SSA home">
          <img
            src="/skyline-logo.png"
            alt="Skyline Student Club"
            className="h-11 w-24 object-contain sm:w-28"
          />
        </Link>

        <nav aria-label="Main" className="hidden min-w-0 flex-1 md:block">
          <ul className="flex items-center justify-center gap-0.5">
            {primaryNavLinks.map((link) => {
              return (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="whitespace-nowrap rounded-lg px-2 py-2 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:px-2.5 lg:text-xs"
                  >
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {user && workspaceLinks.length > 0 && (
          <details className="relative hidden shrink-0 md:block">
            <summary className="cursor-pointer list-none whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              Workspace
            </summary>
            <nav
              aria-label="Workspace"
              className="absolute right-0 top-full z-50 mt-2 max-h-[70vh] w-60 overflow-y-auto rounded-2xl border border-border bg-card p-2 shadow-xl"
            >
              <ul className="flex flex-col">
                {workspaceLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="block rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </details>
        )}

        <div className="flex items-center gap-2">
          {!user ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm font-semibold text-muted-foreground hover:text-foreground px-3 py-2"
              >
                Log In
              </Link>
              <Link
                to="/membership/join"
                className={cn(buttonVariants({ size: 'sm' }), 'rounded-full px-4')}
              >
                Join the club
              </Link>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link
                to="/membership/join"
                className={cn(
                  user.membershipStatus === 'active'
                    ? 'text-xs font-semibold text-emerald-700 hover:text-emerald-800'
                    : buttonVariants({ size: 'sm' }),
                  'rounded-full px-4',
                )}
              >
                {user.membershipStatus === 'active' ? 'Membership active' : 'Join the club'}
              </Link>
              <div className="flex items-center gap-2 rounded-full bg-muted/60 px-3 py-1.5 text-xs font-semibold">
                <User className="h-3.5 w-3.5 text-primary" />
                <span>{user.name}</span>
                <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 uppercase tracking-wider text-[10px]">
                  {user.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-muted"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
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
          <ul className="flex w-full flex-col px-4 py-3">
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
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="text-center text-sm font-semibold py-2"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/membership/join"
                    onClick={() => setOpen(false)}
                    className={cn(buttonVariants({ size: 'lg' }), 'h-11 w-full rounded-full')}
                  >
                    Join the club
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-2 p-3 border-t border-border mt-2">
                  <span className="text-sm font-semibold">{user.name} ({user.role})</span>
                  <Link
                    to="/membership/join"
                    onClick={() => setOpen(false)}
                    className="text-sm font-semibold text-primary"
                  >
                    {user.membershipStatus === 'active' ? 'Membership active' : 'Join the club'}
                  </Link>
                  <button onClick={() => { logout(); setOpen(false); }} className="text-sm text-left text-destructive font-medium">Log out</button>
                </div>
              )}
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
