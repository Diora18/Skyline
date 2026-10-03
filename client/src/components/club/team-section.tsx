import { SectionHeading } from './section-heading'
import { cn } from '@/lib/utils'

const team = [
  { name: 'Maya Chen', role: 'President', major: 'Economics, Senior', initials: 'MC' },
  { name: 'Diego Alvarez', role: 'Vice President', major: 'CS, Junior', initials: 'DA' },
  { name: 'Amara Okafor', role: 'Events Lead', major: 'Marketing, Junior', initials: 'AO' },
  { name: 'Sam Patel', role: 'Treasurer', major: 'Finance, Sophomore', initials: 'SP' },
]

const swatches = [
  'bg-primary text-primary-foreground',
  'bg-accent text-accent-foreground',
  'bg-secondary text-secondary-foreground',
  'bg-muted text-foreground',
]

export function TeamSection() {
  return (
    <section id="team" className="scroll-mt-16 border-t border-border py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="The board"
            title="Run by students, for students"
            description="Elected every spring by members. Say hi at any event — we don't bite."
          />
          <a href="mailto:board@clubnova.edu" className="font-semibold text-primary underline-offset-4 hover:underline">
            board@clubnova.edu
          </a>
        </div>

        <ul className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {team.map((m, i) => (
            <li
              key={m.name}
              tabIndex={0}
              className="group relative isolate flex min-h-82.5 flex-col items-center overflow-hidden rounded-3xl border border-border bg-card px-5 pb-5 pt-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-secondary/40 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="absolute inset-x-0 top-0 z-0 h-[58%] origin-top -translate-y-full rounded-b-[50%] bg-secondary transition-transform duration-300 group-hover:translate-y-0 group-focus-visible:translate-y-0" />
              <div
                className={cn(
                  'relative z-10 flex aspect-square w-full items-center justify-center rounded-2xl font-display text-5xl font-extrabold transition-all duration-300 group-hover:aspect-square group-hover:w-3/4 group-hover:rounded-full group-hover:ring-8 group-hover:ring-background group-focus-visible:aspect-square group-focus-visible:w-3/4 group-focus-visible:rounded-full group-focus-visible:ring-8 group-focus-visible:ring-background',
                  swatches[i % swatches.length],
                )}
                aria-hidden="true"
              >
                <span className="transition-transform duration-300 group-hover:scale-110 group-focus-visible:scale-110">{m.initials}</span>
              </div>
              <div className="relative z-10 mt-4 w-full transition-colors duration-300 group-hover:text-foreground group-focus-visible:text-foreground">
                <p className="text-xs font-bold uppercase tracking-widest text-primary">{m.role}</p>
                <h3 className="text-xl font-bold">{m.name}</h3>
                <p className="text-sm text-muted-foreground">{m.major}</p>
              </div>
              <div className="relative z-10 mt-auto max-h-0 w-full overflow-hidden border-t border-transparent text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground opacity-0 transition-all duration-300 group-hover:mt-4 group-hover:max-h-12 group-hover:border-border group-hover:pt-3 group-hover:opacity-100 group-focus-visible:mt-4 group-focus-visible:max-h-12 group-focus-visible:border-border group-focus-visible:pt-3 group-focus-visible:opacity-100">
                Skyline SSA Board
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
