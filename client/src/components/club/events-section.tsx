'use client'

import { useState } from 'react'

import { Check, Clock, MapPin, Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionHeading } from './section-heading'
import { cn } from '@/lib/utils'

type Category = 'All' | 'Social' | 'Workshop' | 'Hackathon' | 'Trip'

type ClubEvent = {
  id: string
  title: string
  category: Exclude<Category, 'All'>
  month: string
  day: string
  time: string
  location: string
  spotsLeft: number
  price: string
  membersOnly?: boolean
  image?: string
}

const events: ClubEvent[] = [
  {
    id: 'hack',
    title: 'Nova Hack 24h',
    category: 'Hackathon',
    month: 'Oct',
    day: '18',
    time: '6:00 PM — 6:00 PM',
    location: 'Engineering Atrium',
    spotsLeft: 22,
    price: 'Free for members',
    membersOnly: true,
    image: '/images/event-hackathon.png',
  },
  {
    id: 'rooftop',
    title: 'Rooftop Welcome Social',
    category: 'Social',
    month: 'Oct',
    day: '09',
    time: '7:00 PM — 10:00 PM',
    location: 'Student Union, Level 5',
    spotsLeft: 40,
    price: 'Free',
    image: '/images/event-social.png',
  },
  {
    id: 'pitch',
    title: 'Pitch Your Idea Workshop',
    category: 'Workshop',
    month: 'Oct',
    day: '14',
    time: '5:30 PM — 7:00 PM',
    location: 'Library Room 204',
    spotsLeft: 12,
    price: 'Free',
    image: '/images/event-workshop.png',
  },
  {
    id: 'hike',
    title: 'Fall Colors Day Hike',
    category: 'Trip',
    month: 'Oct',
    day: '26',
    time: '8:00 AM — 5:00 PM',
    location: 'Meet at Main Gate',
    spotsLeft: 6,
    price: '$10 · bus included',
    membersOnly: true,
  },
  {
    id: 'games',
    title: 'Board Game Marathon',
    category: 'Social',
    month: 'Nov',
    day: '02',
    time: '4:00 PM — 11:00 PM',
    location: 'Commons Lounge',
    spotsLeft: 30,
    price: 'Free',
  },
]

const categories: Category[] = ['All', 'Social', 'Workshop', 'Hackathon', 'Trip']

export function EventsSection() {
  const [filter, setFilter] = useState<Category>('All')
  const [rsvps, setRsvps] = useState<Set<string>>(new Set())

  const toggleRsvp = (id: string) =>
    setRsvps((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const [featured, ...rest] = events
  const filtered = rest.filter((e) => filter === 'All' || e.category === filter)

  return (
    <section id="events" className="scroll-mt-16 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="What's on"
            title="Upcoming events"
            description="From chill socials to all-night hackathons — RSVP in one tap and save your spot."
          />
          <div role="group" aria-label="Filter events" className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={filter === c}
                onClick={() => setFilter(c)}
                className={cn(
                  'rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                  filter === c
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-card hover:border-foreground',
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-5">
          <article className="group relative flex min-h-[28rem] flex-col justify-end overflow-hidden rounded-3xl border-2 border-foreground lg:col-span-3">
            <img
              src={featured.image!}
              alt=""
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/60 to-transparent" />
            <div className="relative flex flex-col gap-4 p-6 text-secondary-foreground md:p-8">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">
                  Featured
                </span>
                <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-foreground">
                  {featured.category}
                </span>
              </div>
              <h3 className="text-3xl font-extrabold md:text-4xl">{featured.title}</h3>
              <p className="max-w-md text-secondary-foreground/80">
                24 hours. Teams of four. Mentors from local startups, unlimited snacks and $2,000 in
                prizes.
              </p>
              <EventMeta event={featured} invert />
              <div className="flex flex-wrap items-center gap-4">
                <RsvpButton active={rsvps.has(featured.id)} onClick={() => toggleRsvp(featured.id)} />
                <span className="text-sm text-secondary-foreground/80">
                  {featured.spotsLeft} spots left · {featured.price}
                </span>
              </div>
            </div>
          </article>

          <ul className="flex flex-col gap-4 lg:col-span-2">
            {filtered.length === 0 && (
              <li className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
                No {filter.toLowerCase()} events right now — check back soon.
              </li>
            )}
            {filtered.map((event) => (
              <li key={event.id}>
                <article className="flex gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-foreground">
                  <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-muted py-2">
                    <span className="text-xs font-bold uppercase text-primary">{event.month}</span>
                    <span className="font-display text-2xl font-extrabold">{event.day}</span>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-bold leading-snug">{event.title}</h3>
                      {event.membersOnly && (
                        <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                          Members
                        </span>
                      )}
                    </div>
                    <EventMeta event={event} />
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">
                        {event.spotsLeft <= 10 ? (
                          <span className="font-semibold text-primary">Only {event.spotsLeft} left</span>
                        ) : (
                          `${event.spotsLeft} spots`
                        )}{' '}
                        · {event.price}
                      </span>
                      <RsvpButton
                        small
                        active={rsvps.has(event.id)}
                        onClick={() => toggleRsvp(event.id)}
                      />
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function EventMeta({ event, invert }: { event: ClubEvent; invert?: boolean }) {
  return (
    <ul
      className={cn(
        'flex flex-wrap gap-x-4 gap-y-1 text-sm',
        invert ? 'text-secondary-foreground/80' : 'text-muted-foreground',
      )}
    >
      <li className="flex items-center gap-1.5">
        <Clock className="size-3.5" aria-hidden="true" />
        {event.time}
      </li>
      <li className="flex items-center gap-1.5">
        <MapPin className="size-3.5" aria-hidden="true" />
        {event.location}
      </li>
    </ul>
  )
}

function RsvpButton({
  active,
  onClick,
  small,
}: {
  active: boolean
  onClick: () => void
  small?: boolean
}) {
  return (
    <Button
      onClick={onClick}
      aria-pressed={active}
      variant={active ? 'secondary' : 'default'}
      className={cn(
        'rounded-full font-semibold',
        small ? 'h-8 px-3' : 'h-11 px-5 text-base',
        active && !small && 'bg-accent text-accent-foreground hover:bg-accent/90',
      )}
    >
      {active ? <Check data-icon="inline-start" /> : <Ticket data-icon="inline-start" />}
      {active ? "You're going" : 'RSVP'}
    </Button>
  )
}
