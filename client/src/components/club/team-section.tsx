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
            <li key={m.name} className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5">
              <div
                className={cn(
                  'flex aspect-square items-center justify-center rounded-2xl font-display text-5xl font-extrabold',
                  swatches[i % swatches.length],
                )}
                aria-hidden="true"
              >
                {m.initials}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary">{m.role}</p>
                <h3 className="text-xl font-bold">{m.name}</h3>
                <p className="text-sm text-muted-foreground">{m.major}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
