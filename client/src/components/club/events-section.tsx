'use client'

import { useState, useEffect, useContext } from 'react'
import { Check, Clock, MapPin, Ticket, Loader2, Plus, Pencil, Trash2, Users, X, UserCheck, UserX, BadgeCheck, CalendarDays, Search, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionHeading } from './section-heading'
import { cn } from '@/lib/utils'
import eventService from '@/services/eventService'
import ticketService from '@/services/ticketService'
import memberService from '@/services/memberService'
import { AuthContext } from '@/context/AuthContext'
import { EventDetailModal } from './EventDetailModal'
import { AlumniSocialLinks } from './alumni-social-links'
import volunteerService from '@/services/volunteerService'

type Category = 'All' | 'gala' | 'fundraiser' | 'meeting' | 'workshop' | 'social'

const categories: Category[] = ['All', 'gala', 'fundraiser', 'meeting', 'workshop', 'social']

const emptyEventForm = {
  title: '',
  description: '',
  category: 'meeting',
  bannerImage: '',
  venue: '',
  address: '',
  startDate: '',
  endDate: '',
  memberPrice: '0',
  nonMemberPrice: '0',
  capacity: '',
  status: 'published',
  createLinkedProject: false,
}

const toLocalDateTime = (value: string) => {
  if (!value) return ''
  const date = new Date(value)
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 16)
}

export function EventsSection() {
  const { user, token, isMember, isOfficer, isVolunteer, isTreasurer } = useContext(AuthContext)
  const [filter, setFilter] = useState<Category>('All')
  const [search, setSearch] = useState('')
  const [eventsList, setEventsList] = useState<any[]>([])
  const [myTicketEventIds, setMyTicketEventIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null)
  const [managementEvent, setManagementEvent] = useState<any | null>(null)
  const [eventForm, setEventForm] = useState<any>(emptyEventForm)
  const [savingEvent, setSavingEvent] = useState(false)
  const [managementError, setManagementError] = useState('')
  const [members, setMembers] = useState<any[]>([])
  const [attendees, setAttendees] = useState<any[]>([])
  const [attendeeStats, setAttendeeStats] = useState<any | null>(null)
  const [volunteerApplications, setVolunteerApplications] = useState<any[]>([])
  const [volunteerApplicationsLoaded, setVolunteerApplicationsLoaded] = useState(false)
  const [volunteerApplicationsLoading, setVolunteerApplicationsLoading] = useState(false)
  const [volunteerActionId, setVolunteerActionId] = useState('')
  const [currentTime] = useState(() => Date.now())

  const fetchEvents = async () => {
    setLoading(true)
    try {
      if (isOfficer) {
        const results = await Promise.all(
          ['published', 'draft', 'cancelled', 'completed'].map((status) =>
            eventService.getEvents({ status, limit: 100 })
          )
        )
        const events = results.flatMap((result) => result.data.events || [])
        setEventsList([...new Map(events.map((event: any) => [event._id, event])).values()])
      } else {
        const res = await eventService.getEvents()
        setEventsList(res.data.events || [])
      }
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
  }, [isOfficer])

  useEffect(() => {
    fetchMyTickets()
  }, [token])

  const handleTicketPurchased = (eventId: string) => {
    setMyTicketEventIds((prev) => new Set(prev).add(eventId))
    fetchEvents()
  }

  const canManageEvent = (event: any) => {
    const id = String(user?._id || '')
    return Boolean(id && (
      isOfficer ||
      String(event.createdBy?._id || event.createdBy || '') === id ||
      event.managers?.some((manager: any) => String(manager?._id || manager) === id)
    ))
  }

  const openEventManager = async (event: any | null) => {
    setManagementError('')
    setAttendees([])
    setAttendeeStats(null)
    setMembers([])
    setEventForm(event ? {
      title: event.title || '',
      description: event.description || '',
      category: event.category || 'meeting',
      bannerImage: event.bannerImage || '',
      venue: event.venue || '',
      address: event.address || '',
      startDate: toLocalDateTime(event.startDate),
      endDate: toLocalDateTime(event.endDate),
      memberPrice: String(event.memberPrice ?? 0),
      nonMemberPrice: String(event.nonMemberPrice ?? 0),
      capacity: event.capacity == null ? '' : String(event.capacity),
      status: event.status || 'published',
      createLinkedProject: false,
    } : emptyEventForm)
    setManagementEvent(event || { _id: null, managers: [] })

    if (event?._id) {
      try {
        const response = await eventService.getEventById(event._id)
        const currentEvent = response.data.event
        setManagementEvent(currentEvent)
        setEventForm({
          title: currentEvent.title || '',
          description: currentEvent.description || '',
          category: currentEvent.category || 'meeting',
          bannerImage: currentEvent.bannerImage || '',
          venue: currentEvent.venue || '',
          address: currentEvent.address || '',
          startDate: toLocalDateTime(currentEvent.startDate),
          endDate: toLocalDateTime(currentEvent.endDate),
          memberPrice: String(currentEvent.memberPrice ?? 0),
          nonMemberPrice: String(currentEvent.nonMemberPrice ?? 0),
          capacity: currentEvent.capacity == null ? '' : String(currentEvent.capacity),
          status: currentEvent.status || 'published',
          createLinkedProject: false,
        })
      } catch (err: any) {
        setManagementError(err.message || 'Unable to load event details.')
      }
    }

    if (isOfficer) {
      try {
        const response = await memberService.getMembers({ limit: 100 })
        setMembers(response.data.members || [])
      } catch (err: any) {
        setManagementError(err.message || 'Unable to load members for event manager assignment.')
      }
    }
  }

  const handleSaveEvent = async (e: any) => {
    e.preventDefault()
    if (new Date(eventForm.endDate) <= new Date(eventForm.startDate)) {
      setManagementError('Event end time must be later than its start time.')
      return
    }
    setSavingEvent(true)
    setManagementError('')
    const payload = {
      ...eventForm,
      memberPrice: Number(eventForm.memberPrice),
      nonMemberPrice: Number(eventForm.nonMemberPrice),
      capacity: eventForm.capacity === '' ? null : Number(eventForm.capacity),
      startDate: new Date(eventForm.startDate).toISOString(),
      endDate: new Date(eventForm.endDate).toISOString(),
    }
    try {
      if (managementEvent?._id) {
        await eventService.updateEvent(managementEvent._id, payload)
      } else {
        await eventService.createEvent(payload)
      }
      setManagementEvent(null)
      await fetchEvents()
    } catch (err: any) {
      setManagementError(err.message || 'Unable to save event.')
    } finally {
      setSavingEvent(false)
    }
  }

  const handleDeleteEvent = async (event: any) => {
    if (!window.confirm(`Delete "${event.title}"? This action cannot be undone.`)) return
    try {
      await eventService.deleteEvent(event._id)
      await fetchEvents()
    } catch (err: any) {
      window.alert(err.message || 'Unable to delete event.')
    }
  }

  const handleManagerChange = async (action: 'add' | 'remove', memberId: string) => {
    if (!managementEvent?._id) return
    setManagementError('')
    try {
      await eventService.manageManagers(managementEvent._id, action, memberId)
      const response = await eventService.getEventById(managementEvent._id)
      setManagementEvent(response.data.event)
      await fetchEvents()
    } catch (err: any) {
      setManagementError(err.message || 'Unable to update event managers.')
    }
  }

  const handleLoadAttendees = async () => {
    if (!managementEvent?._id) return
    setManagementError('')
    try {
      const response = await ticketService.getEventTickets(managementEvent._id)
      setAttendees(response.data.tickets || [])
      setAttendeeStats(response.data)
    } catch (err: any) {
      setManagementError(err.message || 'Unable to load event attendees.')
    }
  }

  const handleLoadVolunteerApplications = async () => {
    if (!managementEvent?._id) return
    setVolunteerApplicationsLoading(true)
    setManagementError('')
    try {
      const response = await volunteerService.getEventApplications(managementEvent._id)
      setVolunteerApplications(response.data?.applications || [])
      setVolunteerApplicationsLoaded(true)
    } catch (err: any) {
      setManagementError(err.message || 'Unable to load event volunteer applications.')
    } finally {
      setVolunteerApplicationsLoading(false)
    }
  }

  const handleVolunteerApplicationUpdate = async (applicationId: string, updates: any) => {
    if (!managementEvent?._id) return
    setVolunteerActionId(applicationId)
    setManagementError('')
    try {
      const response = await volunteerService.updateApplication(managementEvent._id, applicationId, updates)
      const updated = response.data.application
      setVolunteerApplications((current) =>
        current.map((application) => application._id === applicationId ? updated : application)
      )
    } catch (err: any) {
      setManagementError(err.message || 'Unable to update volunteer application.')
    } finally {
      setVolunteerActionId('')
    }
  }

  const filtered = eventsList.filter((e) => {
    const matchesCategory = filter === 'All' || e.category?.toLowerCase() === filter.toLowerCase()
    const query = search.trim().toLowerCase()
    const matchesSearch = !query || [e.title, e.description, e.venue, e.category]
      .some((value) => String(value || '').toLowerCase().includes(query))
    return matchesCategory && matchesSearch
  }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

  return (
    <section id="events" className="scroll-mt-16 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="What's on"
            title="Upcoming events"
            description="From chill socials to all-night hackathons — RSVP in one tap and save your spot."
          />
          <div className="flex flex-col items-start gap-3 md:items-end">
            {isOfficer && (
              <Button onClick={() => openEventManager(null)} className="rounded-full">
                <Plus className="mr-2 h-4 w-4" /> Create Event
              </Button>
            )}
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={filter === c}
                  onClick={() => setFilter(c)}
                  className={cn(
                    'rounded-full border px-4 py-2 text-sm font-semibold capitalize transition-colors',
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
        </div>

        <label className="relative mt-8 block max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search events, venues, categories..."
            aria-label="Search events"
            className="h-11 w-full rounded-full border border-input bg-card pl-11 pr-4 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>

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
            <p className="mt-1 text-sm">
              {search ? `No events match “${search}”.` : `No ${filter !== 'All' ? filter.toLowerCase() : ''} events are currently scheduled.`}
            </p>
            {search && (
              <Button variant="outline" size="sm" className="mt-4 rounded-full" onClick={() => setSearch('')}>
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((event) => {
              const startDate = new Date(event.startDate)
              const isAlumniEvent = /alumni/i.test(event.title)
              const spotsLeft = event.capacity == null ? null : Math.max(0, event.capacity - (event.ticketsSold || 0))

              return (
                <li key={event._id} className="min-w-0">
                  <article
                    onClick={() => setSelectedEvent(event)}
                    className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/30 to-accent/30">
                      {event.bannerImage ? (
                        <img
                          src={event.bannerImage}
                          alt=""
                          loading="lazy"
                          className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(imageEvent: any) => { imageEvent.currentTarget.style.display = 'none' }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-primary/70">
                          <div className="flex size-20 items-center justify-center rounded-3xl border border-white/50 bg-white/30 shadow-sm backdrop-blur-sm">
                            {isAlumniEvent ? <Users className="size-10" /> : <CalendarDays className="size-10" />}
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/10" />
                      <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-background/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground shadow-sm backdrop-blur">
                          {isAlumniEvent ? 'Alumni connection' : event.category}
                        </span>
                        {isOfficer && event.status !== 'published' && (
                          <span className="rounded-full bg-amber-400/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-black">
                            {event.status}
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-4 left-4 flex size-14 flex-col items-center justify-center rounded-2xl bg-background/95 text-foreground shadow-lg backdrop-blur">
                        <span className="text-[10px] font-bold uppercase leading-none text-primary">
                          {startDate.toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="mt-1 text-xl font-extrabold leading-none">{startDate.getDate()}</span>
                      </div>
                      {myTicketEventIds.has(event._id) && (
                        <span className="absolute bottom-5 right-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow">
                          <Check className="size-3.5" /> Going
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-xl font-bold leading-snug">
                        <button
                          type="button"
                          onClick={(clickEvent) => {
                            clickEvent.stopPropagation()
                            setSelectedEvent(event)
                          }}
                          className="flex w-full items-start justify-between gap-2 text-left transition-colors hover:text-primary focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          <span>{event.title}</span>
                          <ArrowUpRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" aria-hidden="true" />
                        </button>
                      </h3>
                      <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-relaxed text-muted-foreground">
                        {event.description || 'Join the Skyline community for this upcoming event.'}
                      </p>
                      <div className="mt-4">
                        <EventMeta event={event} />
                      </div>

                      {isAlumniEvent && (
                        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-primary/15 bg-primary/5 px-3 py-2.5">
                          <div>
                            <p className="text-xs font-semibold text-primary">Alumni spotlight</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">Connect with Skyline graduates and find their community.</p>
                          </div>
                          <AlumniSocialLinks />
                        </div>
                      )}

                      <div className="mt-auto pt-5">
                        <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold">
                              Member: {event.memberPrice === 0 ? 'Free' : `$${event.memberPrice}`}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                              Non-member: {event.nonMemberPrice === 0 ? 'Free' : `$${event.nonMemberPrice}`}
                              {' · '}
                              {isMember ? 'Member price applied' : 'Non-member price applies'}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {spotsLeft == null ? 'Open entry' : `${spotsLeft} spots left`}
                            </p>
                          </div>
                          <RsvpButton
                            small
                            active={myTicketEventIds.has(event._id)}
                            onClick={(clickEvent) => {
                              clickEvent.stopPropagation()
                              setSelectedEvent(event)
                            }}
                          />
                        </div>

                        {(isOfficer || canManageEvent(event)) && (
                          <div className="mt-3 flex gap-2" onClick={(clickEvent) => clickEvent.stopPropagation()}>
                            <Button variant="outline" size="sm" className="rounded-full" onClick={() => openEventManager(event)}>
                              <Pencil className="mr-1 h-3.5 w-3.5" /> Manage event
                            </Button>
                            {isOfficer && (
                              <Button variant="destructive" size="sm" className="rounded-full" onClick={() => handleDeleteEvent(event)}>
                                <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onTicketPurchased={handleTicketPurchased}
        />
      )}

      {managementEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
          <section className="my-auto max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-border bg-card p-6 text-card-foreground shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold">{managementEvent._id ? 'Manage Event' : 'Create Event'}</h2>
                <p className="mt-1 text-sm text-muted-foreground">Edit event information and authorized event operations.</p>
              </div>
              <button aria-label="Close event manager" onClick={() => setManagementEvent(null)} className="rounded-full p-2 hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            {managementError && <p role="alert" className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{managementError}</p>}

            <form onSubmit={handleSaveEvent} className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium sm:col-span-2">Title
                <input required value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2" />
              </label>
              <label className="text-sm font-medium">Category
                <select value={eventForm.category} onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })} className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2">
                  {categories.filter((category) => category !== 'All').map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>
              <label className="text-sm font-medium">Status
                <select value={eventForm.status} onChange={(e) => setEventForm({ ...eventForm, status: e.target.value })} className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2">
                  {['draft', 'published', 'cancelled', 'completed'].map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
              <label className="text-sm font-medium">Venue
                <input required value={eventForm.venue} onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })} className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2" />
              </label>
              <label className="text-sm font-medium">Address
                <input value={eventForm.address} onChange={(e) => setEventForm({ ...eventForm, address: e.target.value })} className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2" />
              </label>
              <label className="text-sm font-medium">Start
                <input required type="datetime-local" value={eventForm.startDate} onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })} className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2" />
              </label>
              <label className="text-sm font-medium">End
                <input required type="datetime-local" value={eventForm.endDate} onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })} className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2" />
              </label>
              <label className="text-sm font-medium">Member price
                <input required type="number" min="0" step="0.01" value={eventForm.memberPrice} onChange={(e) => setEventForm({ ...eventForm, memberPrice: e.target.value })} className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2" />
              </label>
              <label className="text-sm font-medium">Non-member price
                <input required type="number" min="0" step="0.01" value={eventForm.nonMemberPrice} onChange={(e) => setEventForm({ ...eventForm, nonMemberPrice: e.target.value })} className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2" />
              </label>
              <label className="text-sm font-medium">Capacity (blank = unlimited)
                <input type="number" min="1" value={eventForm.capacity} onChange={(e) => setEventForm({ ...eventForm, capacity: e.target.value })} className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2" />
              </label>
              <label className="text-sm font-medium">Banner image URL
                <input type="url" value={eventForm.bannerImage} onChange={(e) => setEventForm({ ...eventForm, bannerImage: e.target.value })} className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2" />
              </label>
              <label className="text-sm font-medium sm:col-span-2">Description
                <textarea rows={3} value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2" />
              </label>
              {!managementEvent._id && (
                <label className="flex items-center gap-2 text-sm sm:col-span-2">
                  <input type="checkbox" checked={eventForm.createLinkedProject} onChange={(e) => setEventForm({ ...eventForm, createLinkedProject: e.target.checked })} />
                  Create a linked project board
                </label>
              )}
              <div className="flex justify-end gap-2 sm:col-span-2">
                <Button type="button" variant="ghost" onClick={() => setManagementEvent(null)}>Cancel</Button>
                <Button type="submit" disabled={savingEvent}>{savingEvent ? 'Saving...' : 'Save Event'}</Button>
              </div>
            </form>

            {managementEvent._id && (
              <div className="mt-6 space-y-5 border-t border-border pt-5">
                {isOfficer && (
                  <div>
                    <h3 className="flex items-center gap-2 font-bold"><Users className="h-4 w-4" /> Event Managers</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(managementEvent.managers || []).map((manager: any) => (
                        <span key={manager._id || manager} className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs">
                          {manager.name || manager.email || String(manager)}
                          <button type="button" aria-label={`Remove ${manager.name || 'manager'}`} onClick={() => handleManagerChange('remove', manager._id || manager)} className="text-destructive">×</button>
                        </span>
                      ))}
                      <select aria-label="Add event manager" defaultValue="" onChange={(e) => { if (e.target.value) handleManagerChange('add', e.target.value); e.target.value = '' }} className="rounded-full border border-input bg-background px-3 py-1 text-xs">
                        <option value="">Add manager...</option>
                        {members.filter((member) => !(managementEvent.managers || []).some((manager: any) => String(manager._id || manager) === String(member._id))).map((member) => (
                          <option key={member._id} value={member._id}>{member.name} ({member.role})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {canManageEvent(managementEvent) && (
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="flex items-center gap-2 font-bold"><Users className="h-4 w-4" /> Event Volunteers</h3>
                        <p className="mt-1 text-xs text-muted-foreground">Review applications for this event only.</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleLoadVolunteerApplications}
                        disabled={volunteerApplicationsLoading}
                      >
                        {volunteerApplicationsLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                        {volunteerApplicationsLoading ? 'Loading...' : 'Load applications'}
                      </Button>
                    </div>
                    {volunteerApplications.length > 0 ? (
                      <div className="mt-3 max-h-80 space-y-3 overflow-auto">
                        {volunteerApplications.map((application) => (
                          <article key={application._id} className="rounded-xl border border-border p-3">
                            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                              <div className="min-w-0">
                                <p className="font-semibold">{application.user?.name || 'Unknown member'}</p>
                                <p className="break-all text-xs text-muted-foreground">
                                  {[application.user?.email, application.user?.studentId, application.user?.role]
                                    .filter(Boolean).join(' · ')}
                                </p>
                                <span className="mt-2 inline-block rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold capitalize text-primary">
                                  {application.status}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {application.status === 'pending' && (
                                  <>
                                    <Button
                                      type="button"
                                      size="sm"
                                      disabled={volunteerActionId === application._id}
                                      onClick={() => handleVolunteerApplicationUpdate(application._id, { status: 'approved' })}
                                    >
                                      <UserCheck className="mr-1.5 size-4" /> Approve
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="destructive"
                                      disabled={volunteerActionId === application._id}
                                      onClick={() => handleVolunteerApplicationUpdate(application._id, { status: 'rejected' })}
                                    >
                                      <UserX className="mr-1.5 size-4" /> Reject
                                    </Button>
                                  </>
                                )}
                                {application.status === 'approved' && new Date(managementEvent.endDate).getTime() <= currentTime && (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    disabled={volunteerActionId === application._id}
                                    onClick={() => handleVolunteerApplicationUpdate(application._id, { status: 'completed' })}
                                  >
                                    <BadgeCheck className="mr-1.5 size-4" /> Mark completed
                                  </Button>
                                )}
                              </div>
                            </div>
                            {(application.status === 'approved' || application.status === 'completed') && (
                              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                                <input
                                  aria-label={`Responsibility for ${application.user?.name || 'volunteer'}`}
                                  maxLength={120}
                                  value={application.responsibility || ''}
                                  onChange={(e) => setVolunteerApplications((current) =>
                                    current.map((item) => item._id === application._id
                                      ? { ...item, responsibility: e.target.value }
                                      : item)
                                  )}
                                  placeholder="Responsibility (optional)"
                                  className="min-w-0 flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  disabled={volunteerActionId === application._id}
                                  onClick={() => handleVolunteerApplicationUpdate(application._id, {
                                    responsibility: application.responsibility || '',
                                  })}
                                >
                                  Save responsibility
                                </Button>
                              </div>
                            )}
                          </article>
                        ))}
                      </div>
                    ) : volunteerApplicationsLoaded && !volunteerApplicationsLoading && (
                      <p className="mt-3 rounded-xl border border-dashed border-border p-3 text-sm text-muted-foreground">
                        No applications for this event yet.
                      </p>
                    )}
                  </div>
                )}

                {(isOfficer || isVolunteer || isTreasurer || canManageEvent(managementEvent)) && (
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-bold">Attendees</h3>
                      <Button type="button" variant="outline" size="sm" onClick={handleLoadAttendees}>Load attendees</Button>
                    </div>
                    {attendeeStats && (
                      <p className="mt-2 text-xs text-muted-foreground">{attendeeStats.checkedIn} checked in · {attendeeStats.total} tickets · {attendeeStats.remaining} remaining</p>
                    )}
                    {attendees.length > 0 && (
                      <div className="mt-2 max-h-48 overflow-auto rounded-xl border border-border">
                        {attendees.map((ticket) => (
                          <div key={ticket._id} className="flex justify-between gap-3 border-b border-border px-3 py-2 text-sm last:border-b-0">
                            <span>{ticket.user?.name || 'Unknown attendee'} · {ticket.user?.email || ''}</span>
                            <span className="capitalize text-muted-foreground">{ticket.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {managementEvent.linkedProject && (
                  <a href={`/projects/${managementEvent.linkedProject._id || managementEvent.linkedProject}`} className="text-sm font-semibold text-primary hover:underline">
                    Open linked project board
                  </a>
                )}
              </div>
            )}
          </section>
        </div>
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
