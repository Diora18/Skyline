import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, ScanLine, Receipt, Loader2, AlertCircle } from 'lucide-react';
import eventService from '@/services/eventService';
import { Button } from '@/components/ui/button';

export default function VolunteerWorkspace() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    eventService.getMyVolunteerAssignments()
      .then((response) => setAssignments(response.data.applications || []))
      .catch((err) => setError(err.message || 'Failed to load volunteer assignments.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen py-12 px-4 md:px-6 max-w-5xl mx-auto">
      <div className="border-b border-border pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-primary">Volunteer workspace</span>
        <h1 className="mt-1 text-3xl md:text-4xl font-extrabold">My volunteer assignments</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Event tools are limited to the events where you have been approved.
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-20 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="mt-8 flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {!loading && !error && assignments.length === 0 && (
        <div className="mt-8 rounded-3xl border border-dashed border-border p-10 text-center">
          <h2 className="text-xl font-bold">No approved assignments yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">Apply to an event and wait for an officer or event manager to approve you.</p>
          <Link to="/events"><Button className="mt-5 rounded-full">Browse events</Button></Link>
        </div>
      )}

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {assignments.map((assignment) => {
          const event = assignment.event;
          return (
            <article key={assignment._id} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Approved volunteer</span>
                  <h2 className="mt-1 text-xl font-extrabold">{event?.title}</h2>
                </div>
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p><CalendarDays className="mr-2 inline h-4 w-4" />{new Date(event.startDate).toLocaleString()}</p>
                <p><MapPin className="mr-2 inline h-4 w-4" />{event.venue}</p>
              </div>
              {assignment.responsibilities?.length > 0 && (
                <p className="mt-4 text-sm"><span className="font-semibold">Responsibilities:</span> {assignment.responsibilities.join(', ')}</p>
              )}
              <div className="mt-5 flex flex-wrap gap-2">
                <Link to={`/scanner?eventId=${event._id}`}>
                  <Button className="rounded-full"><ScanLine className="mr-2 h-4 w-4" /> Scan tickets</Button>
                </Link>
                <Link to={`/expenses/submit?eventId=${event._id}`}>
                  <Button variant="outline" className="rounded-full"><Receipt className="mr-2 h-4 w-4" /> Submit expense</Button>
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
