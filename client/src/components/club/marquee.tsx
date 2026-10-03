import { Asterisk } from 'lucide-react'

const items = [
  'Socials',
  'Workshops',
  'Hackathons',
  'Weekend trips',
  'Mentorship',
  'Career nights',
  'Game nights',
  'Volunteering',
]

export function Marquee() {
  const loop = [...items, ...items]
  return (
    <div className="overflow-hidden border-y-2 border-foreground bg-secondary py-4 text-secondary-foreground">
      <div className="flex w-max animate-marquee items-center gap-8" aria-hidden="true">
        {loop.map((item, i) => (
          <span key={i} className="flex items-center gap-8 font-display text-2xl font-bold md:text-3xl">
            {item}
            <Asterisk className="size-6 text-accent" />
          </span>
        ))}
      </div>
      <p className="sr-only">{items.join(', ')}</p>
    </div>
  )
}
