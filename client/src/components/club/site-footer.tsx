import { ArrowUpRight, Sparkles } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const columns = [
  { title: 'Club', links: [{ label: 'Events', href: '/#events' }, { label: 'Membership', href: '/#membership' }, { label: 'Team', href: '/#team' }] },
  { title: 'Members', links: [{ label: 'Apply now', href: '/login' }, { label: 'Perks', href: '/#perks' }, { label: 'FAQ', href: '/#faq' }] },
  { title: 'Follow', links: [{ label: 'Instagram', href: '#' }, { label: 'Discord', href: '#' }, { label: 'LinkedIn', href: '#' }] },
]

export function SiteFooter() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="flex flex-col items-start justify-between gap-6 border-b border-secondary-foreground/15 pb-12 md:flex-row md:items-end">
          <h2 className="max-w-xl text-4xl font-extrabold leading-tight md:text-6xl">
            Your best semester starts <span className="text-accent">here.</span>
          </h2>
          <a
            href="/login"
            className={cn(
              buttonVariants({ size: 'lg' }),
              'h-14 rounded-full bg-accent px-7 text-base font-semibold text-accent-foreground hover:bg-accent/90',
            )}
          >
            Join Skyline SSA
            <ArrowUpRight data-icon="inline-end" />
          </a>
        </div>

        <div className="grid gap-10 pt-12 md:grid-cols-5">
          <div className="flex flex-col gap-4 md:col-span-2">
            <span className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary">
                <Sparkles className="size-5" aria-hidden="true" />
              </span>
              <span className="font-display text-xl font-bold">Skyline <span className="text-primary">SSA</span></span>
            </span>
            <p className="max-w-xs text-sm text-secondary-foreground/70">
              A registered student organization. Student Union, Room 112 · Open Mon–Thu, 12–6 PM.
            </p>
          </div>
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title} className="flex flex-col gap-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-secondary-foreground/60">{col.title}</h3>
              <ul className="flex flex-col gap-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="hover:text-accent">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <p className="mt-12 text-sm text-secondary-foreground/50">© 2026 Skyline SSA. Made by students, with snacks.</p>
      </div>
    </footer>
  )
}
