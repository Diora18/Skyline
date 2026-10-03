import { Briefcase, Coffee, GraduationCap, Percent, Plane, Trophy } from 'lucide-react'
import { SectionHeading } from './section-heading'

const perks = [
  {
    icon: Briefcase,
    title: 'Career nights',
    body: 'Meet recruiters, alumni and founders at monthly networking nights.',
  },
  {
    icon: GraduationCap,
    title: 'Peer mentorship',
    body: 'Get paired with an upperclass mentor in your major during your first semester.',
  },
  {
    icon: Percent,
    title: 'Partner discounts',
    body: '15% off at 20+ campus cafés, bookstores and local spots with your digital card.',
  },
  {
    icon: Plane,
    title: 'Subsidized trips',
    body: 'Weekend getaways and conference trips at a fraction of the cost.',
  },
  {
    icon: Trophy,
    title: 'Lead a project',
    body: 'Pitch your own initiative and get budget, space and a team to build it.',
  },
  {
    icon: Coffee,
    title: 'Free snacks. Always.',
    body: 'Every meeting. No exceptions. It is in our constitution.',
  },
]

export function PerksSection() {
  return (
    <section id="perks" className="scroll-mt-16 bg-secondary py-20 text-secondary-foreground md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <SectionHeading
          invert
          eyebrow="Why join"
          title={
            <>
              More than a club. <span className="text-accent">A launchpad.</span>
            </>
          }
          description="Membership unlocks real opportunities — and a few hundred new friends."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {perks.map((perk) => (
            <div
              key={perk.title}
              className="group flex flex-col gap-4 rounded-3xl border border-secondary-foreground/15 bg-secondary-foreground/5 p-6 text-secondary-foreground transition-colors duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground focus-within:border-primary focus-within:bg-primary focus-within:text-primary-foreground md:p-8"
            >
              <span
                className="flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground transition-colors duration-200 group-hover:bg-primary-foreground group-hover:text-primary group-focus-within:bg-primary-foreground group-focus-within:text-primary"
              >
                <perk.icon className="size-6" aria-hidden="true" />
              </span>
              <h3 className="text-2xl font-bold">{perk.title}</h3>
              <p className="text-secondary-foreground/70 transition-colors duration-200 group-hover:text-primary-foreground/85 group-focus-within:text-primary-foreground/85">
                {perk.body}
              </p>
            </div>
          ))}
        </div>

        <figure className="mt-12 flex flex-col gap-6 rounded-3xl border border-secondary-foreground/15 p-6 md:flex-row md:items-center md:p-10">
          <blockquote className="flex-1 font-display text-2xl font-semibold leading-snug md:text-3xl">
            {'"I came for the free pizza and left with a co-founder, an internship and my best friends. Joining Nova was the best decision of freshman year."'}
          </blockquote>
          <figcaption className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-full bg-accent font-bold text-accent-foreground">
              PR
            </span>
            <span>
              <span className="block font-semibold">Priya Raman</span>
              <span className="block text-sm text-secondary-foreground/70">Junior, Computer Science</span>
            </span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
