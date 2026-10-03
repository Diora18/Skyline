
import { ArrowRight, CalendarDays, Users } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

const stats = [
  { value: '640+', label: 'Active members' },
  { value: '48', label: 'Events per year' },
  { value: '12', label: 'Sub-groups' },
]

const avatars = ['AK', 'JM', 'SR', 'LT']

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 md:px-6 lg:grid-cols-2 lg:pb-24 lg:pt-20">
        <div className="flex flex-col gap-7">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium">
            <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
            Fall recruitment is open
          </span>

          <h1 className="text-5xl font-extrabold leading-[0.95] tracking-tight md:text-7xl">
            Find your <span className="relative inline-block">
              <span className="relative z-10">people.</span>
              <span
                className="absolute inset-x-0 bottom-1 z-0 h-4 -rotate-1 rounded-sm bg-accent md:h-6"
                aria-hidden="true"
              />
            </span>{' '}
            <span className="text-primary">Build your story.</span>
          </h1>

          <p className="max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
            Skyline SSA is the student-run community for curious people. Socials, workshops,
            hackathons and weekend trips — all in one membership.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/membership/join"
              className={cn(buttonVariants({ size: 'lg' }), 'h-12 rounded-full px-6 text-base')}
            >
              Become a member
              <ArrowRight data-icon="inline-end" />
            </Link>
            <Link
              to="/event"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'h-12 rounded-full bg-transparent px-6 text-base',
              )}
            >
              <CalendarDays data-icon="inline-start" />
              See events
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-2" aria-hidden="true">
              {avatars.map((a, i) => (
                <span
                  key={a}
                  className={cn(
                    'flex size-9 items-center justify-center rounded-full border-2 border-background text-xs font-bold',
                    i % 2 === 0 ? 'bg-secondary text-secondary-foreground' : 'bg-accent text-accent-foreground',
                  )}
                >
                  {a}
                </span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">86 students</span> joined this week
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border-2 border-foreground sm:aspect-[5/4] lg:aspect-[4/5]">
            <img
              src="/images/hero.png"
              alt="Skyline SSA members laughing together on the campus lawn"
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>

          <div className="absolute -left-3 bottom-8 flex items-center gap-3 rounded-2xl border-2 border-foreground bg-card p-3 pr-5 shadow-[4px_4px_0_0_var(--foreground)] md:-left-8">
            <span className="flex size-10 items-center justify-center rounded-xl bg-accent">
              <Users className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Next meetup</p>
              <p className="font-display font-bold">Thu · 7PM · Union Hall</p>
            </div>
          </div>

          <div className="absolute -right-2 -top-4 rotate-6 rounded-full bg-primary px-4 py-2 font-display text-sm font-bold text-primary-foreground md:-right-6">
            Est. 2014
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-16 md:px-6">
        <dl className="grid grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-card">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1 px-2 py-6 text-center">
              <dt className="order-2 text-xs text-muted-foreground sm:text-sm">{s.label}</dt>
              <dd className="order-1 font-display text-3xl font-extrabold md:text-4xl">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
