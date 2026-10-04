import { useState } from 'react'
import { Menu, Sparkles, X, LogOut, User } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

const baseNavLinks = [
  { href: '/events', label: 'Events' },
  { href: '/merch', label: 'Merch' },
  { href: '/announcements', label: 'Bulletin' },
  { href: '/perks', label: 'Perks' },
  { href: '/team', label: 'Team' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const { user, logout, canScan, canAccessTreasury, canSubmitExpenses, canAccessProjects, isOfficer, isEventManager, approvedVolunteerEventIds } = useAuth()

  const navLinks = [
    ...baseNavLinks,
    ...(user ? [
      ...(canAccessProjects ? [{ href: '/projects', label: 'Projects' }] : []),
      { href: '/tickets', label: 'My Tickets' },
      { href: '/orders', label: 'My Orders' },
    ] : []),
    ...(canSubmitExpenses ? [
      { href: '/expenses/submit', label: 'Submit Expense' },
    ] : []),
    ...(canSubmitExpenses || approvedVolunteerEventIds?.length > 0 ? [
      { href: '/expenses/my', label: 'My Claims' },
    ] : []),
    ...(approvedVolunteerEventIds?.length > 0 ? [
      { href: '/volunteer', label: 'Volunteer workspace' },
    ] : []),
    ...(isEventManager && !isOfficer ? [
      { href: '/event-manager', label: 'Event manager workspace' },
    ] : []),
    ...(canScan && isOfficer ? [
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
                    className="rounded-lg px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
