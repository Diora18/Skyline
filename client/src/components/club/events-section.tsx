'use client'

import { useState, useEffect, useContext } from 'react'
import { Check, Clock, MapPin, Ticket, Loader2, Plus, Pencil, Trash2, Users, X, UserCheck, UserX, BadgeCheck, CalendarDays, Search, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CustomSelect } from '@/components/ui/custom-select'
import { DateTimePicker } from '@/components/ui/date-time-picker'
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
  const [attendeesLoading, setAttendeesLoading] = useState(false)
  const [showAttendeesModal, setShowAttendeesModal] = useState(false)
  const [attendeeSearch, setAttendeeSearch] = useState('')
  const [attendeeStatusFilter, setAttendeeStatusFilter] = useState<'all' | 'valid' | 'used' | 'cancelled'>('all')
  const [volunteerApplications, setVolunteerApplications] = useState<any[]>([])
  const [volunteerApplicationsLoaded, setVolunteerApplicationsLoaded] = useState(false)
  const [volunteerApplicationsLoading, setVolunteerApplicationsLoading] = useState(false)
  const [volunteerActionId, setVolunteerActionId] = useState('')
  const [showVolunteerModal, setShowVolunteerModal] = useState(false)
  const [volunteerStatusFilter, setVolunteerStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'completed'>('all')
  const [editingResponsibilityId, setEditingResponsibilityId] = useState<string | null>(null)
  const [savedResponsibilityMap, setSavedResponsibilityMap] = useState<Record<string, boolean>>({})
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
    setAttendeeSearch('')
    setAttendeeStatusFilter('all')
    setShowAttendeesModal(false)
    setShowVolunteerModal(false)
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

  const handleDeleteEvent = async (e: any, event: any) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation()
      e.preventDefault()
    }
    const targetEvent = event || managementEvent
    if (!targetEvent?._id) return
    if (!window.confirm(`Delete "${targetEvent.title || 'this event'}"? This action cannot be undone.`)) return

    setManagementError('')
    try {
      await eventService.deleteEvent(targetEvent._id)
      if (managementEvent?._id === targetEvent._id) {
        setManagementEvent(null)
      }
      if (selectedEvent?._id === targetEvent._id) {
        setSelectedEvent(null)
      }
      await fetchEvents()
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Unable to delete event.'
      setManagementError(msg)
      window.alert(msg)
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
    setAttendeesLoading(true)
    setManagementError('')
    try {
      const response = await ticketService.getEventTickets(managementEvent._id)
      setAttendees(response.data.tickets || [])
      setAttendeeStats(response.data)
    } catch (err: any) {
      setManagementError(err.message || 'Unable to load event attendees.')
    } finally {
      setAttendeesLoading(false)
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

    if (!query) return matchesCategory

    const matchesName = String(e.title || '').toLowerCase().includes(query)

    return matchesCategory && matchesName
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

        <div className="relative mt-8 max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            type="text"
            inputMode="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search events by name..."
            aria-label="Search events by name"
            className="h-11 w-full rounded-full border border-input bg-card pl-11 pr-10 text-sm shadow-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/70"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="Clear search"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
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
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full"
                              onClick={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                openEventManager(event)
                              }}
                            >
                              <Pencil className="mr-1 h-3.5 w-3.5" /> Manage event
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="rounded-full"
                              onClick={(e) => handleDeleteEvent(e, event)}
                            >
                              <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                            </Button>
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
              <label className="text-xs font-semibold sm:col-span-2">Title
                <input required value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} className="mt-1 w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-xs font-semibold text-foreground transition-all duration-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30" />
              </label>

              <div className="text-xs font-semibold">
                <span className="block mb-1">Category</span>
                <CustomSelect
                  value={eventForm.category}
                  onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                >
                  {categories.filter((category) => category !== 'All').map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </CustomSelect>
              </div>

              <div className="text-xs font-semibold">
                <span className="block mb-1">Status</span>
                <CustomSelect
                  value={eventForm.status}
                  onChange={(e) => setEventForm({ ...eventForm, status: e.target.value })}
                >
                  {['draft', 'published', 'cancelled', 'completed'].map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </CustomSelect>
              </div>

              <label className="text-xs font-semibold">Venue
                <input required value={eventForm.venue} onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })} className="mt-1 w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-xs font-semibold text-foreground transition-all duration-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30" />
              </label>
              <label className="text-xs font-semibold">Address
                <input value={eventForm.address} onChange={(e) => setEventForm({ ...eventForm, address: e.target.value })} className="mt-1 w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-xs font-semibold text-foreground transition-all duration-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30" />
              </label>

              <div className="text-xs font-semibold">
                <span className="block mb-1">Start Date & Time</span>
                <DateTimePicker
                  required
                  value={eventForm.startDate}
                  onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                  placeholder="Select start date & time"
                />
              </div>

              <div className="text-xs font-semibold">
                <span className="block mb-1">End Date & Time</span>
                <DateTimePicker
                  required
                  value={eventForm.endDate}
                  onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                  placeholder="Select end date & time"
                />
              </div>

              <label className="text-xs font-semibold">Member price
                <input required type="number" min="0" step="0.01" value={eventForm.memberPrice} onChange={(e) => setEventForm({ ...eventForm, memberPrice: e.target.value })} className="mt-1 w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-xs font-semibold text-foreground transition-all duration-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30" />
              </label>
              <label className="text-xs font-semibold">Non-member price
                <input required type="number" min="0" step="0.01" value={eventForm.nonMemberPrice} onChange={(e) => setEventForm({ ...eventForm, nonMemberPrice: e.target.value })} className="mt-1 w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-xs font-semibold text-foreground transition-all duration-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30" />
              </label>

              <label className="text-xs font-semibold">Capacity (blank = unlimited)
                <input type="number" min="1" value={eventForm.capacity} onChange={(e) => setEventForm({ ...eventForm, capacity: e.target.value })} className="mt-1 w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-xs font-semibold text-foreground transition-all duration-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30" />
              </label>
              <label className="text-xs font-semibold">Banner image URL
                <input type="url" value={eventForm.bannerImage} onChange={(e) => setEventForm({ ...eventForm, bannerImage: e.target.value })} className="mt-1 w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-xs font-semibold text-foreground transition-all duration-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30" />
              </label>

              <label className="text-xs font-semibold sm:col-span-2">Description
                <textarea rows={3} value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} className="mt-1 w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-xs font-semibold text-foreground transition-all duration-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30" />
              </label>

              {!managementEvent._id && (
                <label className="flex items-center gap-2 text-xs font-semibold sm:col-span-2">
                  <input type="checkbox" checked={eventForm.createLinkedProject} onChange={(e) => setEventForm({ ...eventForm, createLinkedProject: e.target.checked })} />
                  Create a linked project board
                </label>
              )}
              <div className="flex flex-wrap items-center justify-between gap-2 sm:col-span-2 pt-2 border-t border-border mt-2">
                {managementEvent?._id ? (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="rounded-xl font-bold"
                    onClick={(e) => handleDeleteEvent(e, managementEvent)}
                  >
                    <Trash2 className="mr-1.5 size-4" /> Delete Event
                  </Button>
                ) : <div />}
                <div className="flex items-center gap-2">
                  <Button type="button" variant="ghost" onClick={() => setManagementEvent(null)}>Cancel</Button>
                  <Button type="submit" disabled={savingEvent}>{savingEvent ? 'Saving...' : 'Save Event'}</Button>
                </div>
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
                      <div className="w-48">
                        <CustomSelect
                          placeholder="Add manager..."
                          value=""
                          onChange={(e) => {
                            if (e.target.value) handleManagerChange('add', e.target.value)
                          }}
                        >
                          <option value="">Add manager...</option>
                          {members
                            .filter((member) => !(managementEvent.managers || []).some((manager: any) => String(manager._id || manager) === String(member._id)))
                            .map((member) => (
                              <option key={member._id} value={member._id}>
                                {member.name} ({member.role})
                              </option>
                            ))}
                        </CustomSelect>
                      </div>
                    </div>
                  </div>
                )}

                {canManageEvent(managementEvent) && (
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-muted/20 p-4">
                      <div>
                        <h3 className="flex items-center gap-2 font-bold"><Users className="h-4 w-4 text-primary" /> Event Volunteers</h3>
                        <p className="mt-1 text-xs text-muted-foreground">View applicant requests, accept volunteers, and assign responsibilities in dedicated popup window.</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          setShowVolunteerModal(true)
                          await handleLoadVolunteerApplications()
                        }}
                        disabled={volunteerApplicationsLoading}
                        className="rounded-xl font-bold"
                      >
                        {volunteerApplicationsLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                        <Users className="mr-1.5 size-4" />
                        {volunteerApplicationsLoading ? 'Loading...' : 'Load applications'}
                      </Button>
                    </div>
                  </div>
                )}

                {(isOfficer || isVolunteer || isTreasurer || canManageEvent(managementEvent)) && (
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-muted/20 p-4">
                      <div>
                        <h3 className="flex items-center gap-2 font-bold"><Ticket className="h-4 w-4 text-primary" /> Event Attendees</h3>
                        <p className="mt-1 text-xs text-muted-foreground">View ticket holders, check-in status, attendee details, and ticket status in dedicated popup window.</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          setShowAttendeesModal(true)
                          await handleLoadAttendees()
                        }}
                        disabled={attendeesLoading}
                        className="rounded-xl font-bold"
                      >
                        {attendeesLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                        <Ticket className="mr-1.5 size-4" />
                        {attendeesLoading ? 'Loading...' : 'Load attendees'}
                      </Button>
                    </div>
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

      {/* Dedicated Volunteer Applications Popup Modal */}
      {showVolunteerModal && managementEvent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/65 p-4 backdrop-blur-md animate-in fade-in-0 duration-200">
          <section className="my-auto max-h-[90vh] w-full max-w-3xl flex flex-col overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border p-6 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                    Volunteer Portal
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-foreground mt-1">Volunteer Applications</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Event: <span className="font-bold text-foreground">{managementEvent.title}</span> — Review requests to volunteer and accept applicants.
                </p>
              </div>
              <button
                aria-label="Close volunteer modal"
                onClick={() => setShowVolunteerModal(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error banner if any */}
            {managementError && (
              <div role="alert" className="mx-6 mt-4 rounded-xl bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                {managementError}
              </div>
            )}

            {/* Status Filter Pills */}
            <div className="flex items-center justify-between border-b border-border/70 px-6 py-3 bg-muted/20">
              <div className="flex flex-wrap gap-1.5">
                {(['all', 'pending', 'approved', 'rejected', 'completed'] as const).map((status) => {
                  const count = status === 'all'
                    ? volunteerApplications.length
                    : volunteerApplications.filter((a) => a.status === status).length

                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setVolunteerStatusFilter(status)}
                      className={cn(
                        'rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition-all duration-200',
                        volunteerStatusFilter === status
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                      )}
                    >
                      {status} ({count})
                    </button>
                  )
                })}
              </div>

              <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">
                Total Applicants: <strong className="text-foreground">{volunteerApplications.length}</strong>
              </span>
            </div>

            {/* Scrollable Volunteer Applicants List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[55vh] custom-scrollbar">
              {volunteerApplicationsLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm font-semibold">Loading volunteer applications...</p>
                </div>
              ) : volunteerApplications.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
                  <Users className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
                  <h3 className="text-base font-bold text-foreground">No applications found</h3>
                  <p className="mt-1 text-xs">No members have requested to become a volunteer for this event yet.</p>
                </div>
              ) : (
                (() => {
                  const filteredApps = volunteerApplications.filter((app) =>
                    volunteerStatusFilter === 'all' ? true : app.status === volunteerStatusFilter
                  )

                  if (filteredApps.length === 0) {
                    return (
                      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground text-xs font-medium">
                        No volunteer applications with status "{volunteerStatusFilter}".
                      </div>
                    )
                  }

                  return filteredApps.map((application) => (
                    <article
                      key={application._id}
                      className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Member Info */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                            {application.user?.name ? application.user.name.charAt(0).toUpperCase() : <Users className="size-4" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-extrabold text-sm text-foreground truncate">
                              {application.user?.name || 'Unknown member'}
                            </h4>
                            <p className="text-xs text-muted-foreground truncate">
                              {[application.user?.email, application.user?.studentId, application.user?.role]
                                .filter(Boolean)
                                .join(' · ')}
                            </p>
                          </div>
                        </div>

                        {/* Status Badge & Accept/Reject Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <span
                            className={cn(
                              'rounded-full px-3 py-1 text-xs font-extrabold capitalize border',
                              application.status === 'approved' && 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                              application.status === 'pending' && 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                              application.status === 'rejected' && 'bg-rose-500/10 text-rose-500 border-rose-500/20',
                              application.status === 'completed' && 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                            )}
                          >
                            {application.status}
                          </span>

                          {/* Accept Request Button (Approve) */}
                          {application.status === 'pending' && (
                            <>
                              <Button
                                type="button"
                                size="sm"
                                className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                                disabled={volunteerActionId === application._id}
                                onClick={() => handleVolunteerApplicationUpdate(application._id, { status: 'approved' })}
                              >
                                <UserCheck className="mr-1.5 size-4" /> Accept Volunteer
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                className="rounded-xl font-bold"
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
                              className="rounded-xl font-bold"
                              disabled={volunteerActionId === application._id}
                              onClick={() => handleVolunteerApplicationUpdate(application._id, { status: 'completed' })}
                            >
                              <BadgeCheck className="mr-1.5 size-4" /> Mark Completed
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Responsibility Assignment Section */}
                      {(application.status === 'approved' || application.status === 'completed') && (
                        <div className="mt-3 border-t border-border/50 pt-3">
                          {(application.responsibility || savedResponsibilityMap[application._id]) && editingResponsibilityId !== application._id ? (
                            <div className="flex items-center justify-between rounded-xl border border-border/80 bg-muted/40 px-3.5 py-2 text-xs">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider shrink-0">
                                  Responsibility:
                                </span>
                                <span className="font-bold text-foreground truncate">
                                  {application.responsibility || 'Assigned'}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setEditingResponsibilityId(application._id)}
                                className="ml-2 text-[11px] font-bold text-primary hover:underline shrink-0"
                              >
                                Edit
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2 sm:flex-row">
                              <input
                                aria-label={`Responsibility for ${application.user?.name || 'volunteer'}`}
                                maxLength={120}
                                value={application.responsibility || ''}
                                onChange={(e) =>
                                  setVolunteerApplications((current) =>
                                    current.map((item) =>
                                      item._id === application._id
                                        ? { ...item, responsibility: e.target.value }
                                        : item
                                    )
                                  )
                                }
                                placeholder="Assign responsibility (e.g. Stage Setup, Check-in...)"
                                className="min-w-0 flex-1 rounded-xl border border-input bg-background px-3.5 py-2 text-xs font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-xl font-bold"
                                disabled={volunteerActionId === application._id}
                                onClick={async () => {
                                  await handleVolunteerApplicationUpdate(application._id, {
                                    responsibility: application.responsibility || '',
                                  })
                                  setSavedResponsibilityMap((prev) => ({ ...prev, [application._id]: true }))
                                  setEditingResponsibilityId(null)
                                }}
                              >
                                Save responsibility
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  ))
                })()
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-border p-4 bg-muted/20 flex justify-end">
              <Button type="button" variant="outline" className="rounded-xl font-bold" onClick={() => setShowVolunteerModal(false)}>
                Close
              </Button>
            </div>
          </section>
        </div>
      )}

      {/* Dedicated Event Attendees Popup Modal */}
      {showAttendeesModal && managementEvent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/65 p-4 backdrop-blur-md animate-in fade-in-0 duration-200">
          <section className="my-auto max-h-[90vh] w-full max-w-3xl flex flex-col overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border p-6 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                    Attendee Roster
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-foreground mt-1">Event Attendees</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Event: <span className="font-bold text-foreground">{managementEvent.title}</span> — View ticket holders, check-in status, and attendee details.
                </p>
              </div>
              <button
                aria-label="Close attendees modal"
                onClick={() => setShowAttendeesModal(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error banner if any */}
            {managementError && (
              <div role="alert" className="mx-6 mt-4 rounded-xl bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                {managementError}
              </div>
            )}

            {/* Quick Stats Banner */}
            {attendeeStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 py-3 border-b border-border/70 bg-muted/30">
                <div className="rounded-2xl border border-border/60 bg-card p-3 text-center">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Tickets</span>
                  <span className="text-lg font-extrabold text-foreground">{attendeeStats.total ?? attendees.length}</span>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card p-3 text-center">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Checked In</span>
                  <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{attendeeStats.checkedIn ?? 0}</span>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card p-3 text-center">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Pending Check-In</span>
                  <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400">{attendeeStats.remaining ?? ((attendeeStats.total || attendees.length) - (attendeeStats.checkedIn || 0))}</span>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card p-3 text-center">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-primary">Spots Remaining</span>
                  <span className="text-lg font-extrabold text-foreground">
                    {managementEvent.capacity == null ? 'Unlimited' : Math.max(0, managementEvent.capacity - (attendeeStats.total || attendees.length))}
                  </span>
                </div>
              </div>
            )}

            {/* Search & Status Filter Controls */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between border-b border-border/70 px-6 py-3 bg-muted/20">
              <div className="flex flex-wrap gap-1.5">
                {(['all', 'valid', 'used', 'cancelled'] as const).map((status) => {
                  const count = status === 'all'
                    ? attendees.length
                    : attendees.filter((t) => t.status === status).length

                  const label = status === 'used' ? 'Checked In' : status === 'valid' ? 'Valid' : status

                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setAttendeeStatusFilter(status)}
                      className={cn(
                        'rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition-all duration-200',
                        attendeeStatusFilter === status
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                      )}
                    >
                      {label} ({count})
                    </button>
                  )
                })}
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-56">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={attendeeSearch}
                  onChange={(e) => setAttendeeSearch(e.target.value)}
                  placeholder="Search attendee..."
                  className="h-8 w-full rounded-xl border border-input bg-card pl-8 pr-7 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
                {attendeeSearch && (
                  <button
                    type="button"
                    onClick={() => setAttendeeSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Attendees List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 max-h-[50vh] custom-scrollbar">
              {attendeesLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm font-semibold">Loading attendees...</p>
                </div>
              ) : attendees.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
                  <Ticket className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
                  <h3 className="text-base font-bold text-foreground">No attendees found</h3>
                  <p className="mt-1 text-xs">No tickets have been issued or reserved for this event yet.</p>
                </div>
              ) : (
                (() => {
                  const filteredAttendees = attendees.filter((ticket) => {
                    const matchesStatus = attendeeStatusFilter === 'all' || ticket.status === attendeeStatusFilter
                    const query = attendeeSearch.trim().toLowerCase()
                    if (!query) return matchesStatus

                    const name = String(ticket.user?.name || '').toLowerCase()
                    const email = String(ticket.user?.email || '').toLowerCase()
                    const studentId = String(ticket.user?.studentId || '').toLowerCase()
                    const ticketCode = String(ticket.ticketCode || ticket._id || '').toLowerCase()

                    return matchesStatus && (name.includes(query) || email.includes(query) || studentId.includes(query) || ticketCode.includes(query))
                  })

                  if (filteredAttendees.length === 0) {
                    return (
                      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground text-xs font-medium">
                        No attendees match your search and filter criteria.
                      </div>
                    )
                  }

                  return filteredAttendees.map((ticket) => {
                    const userObj = ticket.user || {}
                    const userName = userObj.name || 'Unknown Attendee'
                    const userEmail = userObj.email || ''
                    const studentId = userObj.studentId || ''
                    const ticketCode = ticket.ticketCode || ticket._id?.slice(-8) || ''
                    const formattedDate = ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : ''

                    return (
                      <article
                        key={ticket._id}
                        className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          {/* Attendee Info */}
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                              {userName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-extrabold text-sm text-foreground truncate">
                                  {userName}
                                </h4>
                                {studentId && (
                                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                                    ID: {studentId}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {[userEmail, formattedDate ? `Issued ${formattedDate}` : ''].filter(Boolean).join(' · ')}
                              </p>
                            </div>
                          </div>

                          {/* Status Badge & Ticket Info */}
                          <div className="flex items-center gap-3 shrink-0">
                            {ticketCode && (
                              <span className="hidden md:inline text-[11px] font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg">
                                #{ticketCode}
                              </span>
                            )}
                            <span
                              className={cn(
                                'rounded-full px-3 py-1 text-xs font-extrabold capitalize border',
                                ticket.status === 'valid' && 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                                ticket.status === 'used' && 'bg-blue-500/10 text-blue-500 border-blue-500/20',
                                ticket.status === 'cancelled' && 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                              )}
                            >
                              {ticket.status === 'used' ? 'Checked In' : ticket.status === 'valid' ? 'Valid Ticket' : ticket.status}
                            </span>
                          </div>
                        </div>
                      </article>
                    )
                  })
                })()
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-border p-4 bg-muted/20 flex justify-end">
              <Button type="button" variant="outline" className="rounded-xl font-bold" onClick={() => setShowAttendeesModal(false)}>
                Close
              </Button>
            </div>
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
