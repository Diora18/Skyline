import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Edit3, Loader2, MapPin, Receipt, ScanLine, AlertCircle } from 'lucide-react';
import eventService from '@/services/eventService';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function EventManagerWorkspace() {
  const { managedEventIds } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    eventService.getEvents({ limit: 100 })
      .then((response) => setEvents((response.data.events || []).filter((event) => managedEventIds.includes(String(event._id)))))
      .catch((err) => setError(err.message || 'Failed to load managed events.'))
      .finally(() => setLoading(false));
  }, [managedEventIds]);

  return (
    <main className="min-h-screen py-12 px-4 md:px-6 max-w-5xl mx-auto">
      <div className="border-b border-border pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-primary">Event operations</span>
        <h1 className="mt-1 text-3xl md:text-4xl font-extrabold">My managed events</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage only the events assigned to you. Event actions remain scoped to each event.
        </p>
      </div>

      {loading && <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
      {error && <div className="mt-8 flex gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive"><AlertCircle className="h-4 w-4" />{error}</div>}
      {!loading && !error && events.length === 0 && (
        <div className="mt-8 rounded-3xl border border-dashed border-border p-10 text-center">
          <h2 className="text-xl font-bold">No managed events</h2>
          <p className="mt-2 text-sm text-muted-foreground">An officer must assign you as a manager for an event.</p>
        </div>
      )}

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {events.map((event) => (
          <article key={event._id} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">{event.status}</span>
                <h2 className="mt-1 text-xl font-extrabold">{event.title}</h2>
              </div>
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p><CalendarDays className="mr-2 inline h-4 w-4" />{new Date(event.startDate).toLocaleString()}</p>
              <p><MapPin className="mr-2 inline h-4 w-4" />{event.venue}</p>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to={`/scanner?eventId=${event._id}`}><Button className="rounded-full"><ScanLine className="mr-2 h-4 w-4" /> Scan tickets</Button></Link>
              <Link to={`/expenses/submit?eventId=${event._id}`}><Button variant="outline" className="rounded-full"><Receipt className="mr-2 h-4 w-4" /> Submit expense</Button></Link>
              <Link to="/events"><Button variant="ghost" className="rounded-full"><Edit3 className="mr-2 h-4 w-4" /> Manage event</Button></Link>
              {event.linkedProject && (
                <Link to={`/projects/${event.linkedProject._id || event.linkedProject}`}>
                  <Button variant="outline" className="rounded-full">Open task board</Button>
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
