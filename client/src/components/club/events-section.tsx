'use client'

import { useState, useEffect, useContext } from 'react'
import { Check, Clock, MapPin, Ticket, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionHeading } from './section-heading'
import { cn } from '@/lib/utils'
import eventService from '@/services/eventService'
import ticketService from '@/services/ticketService'
import { AuthContext } from '@/context/AuthContext'
import { EventDetailModal } from './EventDetailModal'

type Category = 'All' | 'Social' | 'Workshop' | 'Hackathon' | 'Trip' | 'Other'

const categories: Category[] = ['All', 'Social', 'Workshop', 'Hackathon', 'Trip', 'Other']

export function EventsSection() {
  const { user, token, isMember } = useContext(AuthContext)
  const [filter, setFilter] = useState<Category>('All')
  const [eventsList, setEventsList] = useState<any[]>([])
  const [myTicketEventIds, setMyTicketEventIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null)

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const res = await eventService.getEvents()
      setEventsList(res.data.events || [])
    } catch (err) {
      console.error('Failed to load events', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyTickets = async () => {
    if (!token) return
    try {
      const res = await ticketService.getMyTickets()
      const ids = new Set<string>()
      res.data.tickets.forEach((t: any) => {
        if (t.status === 'valid' || t.status === 'used') {
          ids.add(t.event?._id || t.event)
        }
      })
      setMyTicketEventIds(ids)
    } catch (err) {
      console.error('Failed to load tickets', err)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    fetchMyTickets()
  }, [token])

  const handleTicketPurchased = (eventId: string) => {
    setMyTicketEventIds((prev) => new Set(prev).add(eventId))
    fetchEvents()
  }

  const filtered = eventsList.filter((e) => {
    if (filter === 'All') return true
    return e.category?.toLowerCase() === filter.toLowerCase()
  })

  const featured = filtered.find((e) => e.bannerImage) || filtered[0]
  const rest = filtered.filter((e) => e._id !== featured?._id)

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

        {loading ? (
          <div className="mt-12 flex justify-center py-16 text-muted-foreground">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Loading upcoming events...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">
            <Ticket className="mx-auto h-10 w-10 text-muted-foreground/60 mb-3" />
            <h3 className="text-lg font-bold text-foreground">No events found</h3>
            <p className="mt-1 text-sm">No {filter !== 'All' ? filter.toLowerCase() : ''} events are currently scheduled.</p>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 lg:grid-cols-5">
            {featured && (
              <article
                onClick={() => setSelectedEvent(featured)}
                className="group relative flex min-h-[28rem] flex-col justify-end overflow-hidden rounded-3xl border-2 border-foreground lg:col-span-3 cursor-pointer"
              >
                <img
                  src={featured.bannerImage || '/images/event-hackathon.png'}
                  alt={featured.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e: any) => { e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                <div className="relative flex flex-col gap-4 p-6 text-white md:p-8">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">
                      Featured
                    </span>
                    <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-foreground">
                      {featured.category}
                    </span>
                  </div>
                  <h3 className="text-3xl font-extrabold md:text-4xl">{featured.title}</h3>
                  <p className="max-w-md text-white/80 line-clamp-2 text-sm">
                    {featured.description || 'Join us for this featured Skyline SSA event.'}
                  </p>
                  <EventMeta event={featured} invert />
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <RsvpButton
                      active={myTicketEventIds.has(featured._id)}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedEvent(featured)
                      }}
                    />
                    <span className="text-sm text-white/80 font-medium">
                      {featured.capacity !== null
                        ? `${Math.max(0, featured.capacity - featured.ticketsSold)} spots left · `
                        : ''}
                      {isMember ? (featured.memberPrice === 0 ? 'Free' : `$${featured.memberPrice}`) : (featured.nonMemberPrice === 0 ? 'Free' : `$${featured.nonMemberPrice}`)}
                    </span>
                  </div>
                </div>
              </article>
            )}

            <ul className="flex flex-col gap-4 lg:col-span-2">
              {rest.map((event) => {
                const startDate = new Date(event.startDate)
                const month = startDate.toLocaleDateString('en-US', { month: 'short' })
                const day = startDate.getDate()

                return (
                  <li key={event._id}>
                    <article
                      onClick={() => setSelectedEvent(event)}
                      className="flex gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-foreground hover:shadow-md cursor-pointer"
                    >
                      <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-muted py-2">
                        <span className="text-xs font-bold uppercase text-primary">{month}</span>
                        <span className="font-display text-2xl font-extrabold">{day}</span>
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-lg font-bold leading-snug truncate">{event.title}</h3>
                          <span className="shrink-0 rounded-full bg-accent/20 text-accent-foreground px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                            {event.category}
                          </span>
                        </div>
                        <EventMeta event={event} />
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <span className="text-xs text-muted-foreground font-medium">
                            {event.capacity !== null ? (
                              <span className="font-semibold text-primary">
                                {Math.max(0, event.capacity - event.ticketsSold)} spots left
                              </span>
                            ) : (
                              'Open entry'
                            )}{' '}
                            · {isMember ? (event.memberPrice === 0 ? 'Free' : `$${event.memberPrice}`) : (event.nonMemberPrice === 0 ? 'Free' : `$${event.nonMemberPrice}`)}
                          </span>
                          <RsvpButton
                            small
                            active={myTicketEventIds.has(event._id)}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedEvent(event)
                            }}
                          />
                        </div>
                      </div>
                    </article>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onTicketPurchased={handleTicketPurchased}
        />
      )}
    </section>
  )
}

function EventMeta({ event, invert }: { event: any; invert?: boolean }) {
  const startDate = new Date(event.startDate)
  const endDate = new Date(event.endDate)
  const timeStr = `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

  return (
    <ul
      className={cn(
        'flex flex-wrap gap-x-4 gap-y-1 text-sm',
        invert ? 'text-white/80' : 'text-muted-foreground',
      )}
    >
      <li className="flex items-center gap-1.5">
        <Clock className="size-3.5" aria-hidden="true" />
        {timeStr}
      </li>
      <li className="flex items-center gap-1.5">
        <MapPin className="size-3.5" aria-hidden="true" />
        {event.venue}
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
  onClick: (e: any) => void
  small?: boolean
}) {
  return (
    <Button
      onClick={onClick}
      aria-pressed={active}
      variant={active ? 'secondary' : 'default'}
      className={cn(
        'rounded-full font-semibold shrink-0 transition-transform active:scale-95',
        small ? 'h-8 px-3 text-xs' : 'h-11 px-5 text-base',
        active && 'bg-emerald-500 text-white hover:bg-emerald-600',
      )}
    >
      {active ? <Check className="h-4 w-4 mr-1.5" /> : <Ticket className="h-4 w-4 mr-1.5" />}
      {active ? "You're going" : 'RSVP'}
    </Button>
  )
}
