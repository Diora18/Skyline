import { useCallback, useEffect, useState } from 'react';
import { CalendarDays, Clock3, Loader2, ScanLine, Users, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, buttonVariants } from '@/components/ui/button';
import volunteerService from '@/services/volunteerService';

const statusLabels = {
  pending: 'Application Pending',
  approved: 'Volunteer — Approved',
  rejected: 'Application Rejected',
  completed: 'Completed',
};

function VolunteerGroup({ title, applications, emptyMessage, now }) {
  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
        <h2 className="text-xl font-bold">{title}</h2>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{applications.length}</span>
      </div>
      {applications.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {applications.map((application) => {
            const event = application.event;
            return (
              <li key={application._id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold">{event?.title || 'Event no longer available'}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {event?.venue || 'Venue not provided'}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {statusLabels[application.status] || application.status}
                  </span>
                </div>
                {event?.startDate && (
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays className="size-4 text-primary" />
                      {new Date(event.startDate).toLocaleDateString(undefined, {
                        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Clock3 className="size-4 text-primary" />
                      {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
                {application.responsibility && (
                  <p className="mt-3 text-sm">
                    <span className="font-semibold">Responsibility:</span> {application.responsibility}
                  </p>
                )}
                {['approved', 'completed'].includes(application.status) && (
                  <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
                    {application.status === 'approved' && event?._id && new Date(event.endDate || event.startDate).getTime() >= now && (
                      <Link
                        to={`/admin/scanner?eventId=${encodeURIComponent(event._id)}`}
                        className={buttonVariants({ size: 'sm', className: 'rounded-full' })}
                      >
                        <ScanLine className="mr-2 size-4" />
                        Scan this event
                      </Link>
                    )}
                    {event?._id && (
                      <Link
                        to={`/expenses/submit?eventId=${encodeURIComponent(event?._id || '')}`}
                        className={buttonVariants({ size: 'sm', variant: 'outline', className: 'rounded-full' })}
                      >
                        <WalletCards className="mr-2 size-4" />
                        Submit an expense
                      </Link>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default function MyVolunteering() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [now, setNow] = useState(0);

  const loadApplications = useCallback(async () => {
    try {
      const response = await volunteerService.getMyApplications();
      setApplications(response.data?.applications || []);
      setNow(Date.now());
    } catch (loadError) {
      setError(loadError.message || 'Unable to load your volunteering records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const pending = applications.filter((application) => application.status === 'pending');
  const upcoming = applications.filter((application) =>
    application.status === 'approved' &&
    (application.event?.endDate || application.event?.startDate) &&
    new Date(application.event.endDate || application.event.startDate).getTime() >= now
  );
  const completed = applications.filter((application) => application.status === 'completed');
  const upcomingIds = new Set(upcoming.map((application) => application._id));
  const pendingIds = new Set(pending.map((application) => application._id));
  const completedIds = new Set(completed.map((application) => application._id));
  const pastRecords = applications.filter((application) =>
    !upcomingIds.has(application._id) &&
    !pendingIds.has(application._id) &&
    !completedIds.has(application._id)
  );
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-12 md:px-6">
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Event volunteering</span>
          <h1 className="mt-1 text-3xl font-extrabold md:text-4xl">My Volunteering</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Track each event application and your approved volunteer history separately.
          </p>
        </div>
        <Link to="/events" className={buttonVariants({ className: 'rounded-full' })}>
          <Users className="mr-2 size-4" />Browse events
        </Link>
      </header>

      {loading ? (
        <div className="flex flex-col items-center py-24 text-muted-foreground" role="status">
          <Loader2 className="mb-3 size-8 animate-spin text-primary" />
          Loading your event volunteering records...
        </div>
      ) : error ? (
        <div className="mt-8 rounded-xl bg-destructive/10 p-4 text-sm text-destructive" role="alert">
          <p>{error}</p>
          <Button
            variant="outline"
            className="mt-3 rounded-full"
            onClick={() => {
              setError('');
              setLoading(true);
              loadApplications();
            }}
          >
            Try again
          </Button>
        </div>
      ) : applications.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-border p-10 text-center">
          <Users className="mx-auto size-10 text-muted-foreground" />
          <h2 className="mt-3 text-xl font-bold">No event applications yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">Apply to volunteer from an upcoming event’s details.</p>
          <Link to="/events" className={buttonVariants({ className: 'mt-5 rounded-full' })}>
            Explore events
          </Link>
        </div>
      ) : (
        <>
          <VolunteerGroup title="Upcoming & active shifts" applications={upcoming} emptyMessage="No approved upcoming event shifts." now={now} />
          <VolunteerGroup title="Pending applications" applications={pending} emptyMessage="No applications are awaiting review." now={now} />
          <VolunteerGroup title="Completed volunteering" applications={completed} emptyMessage="Completed records will appear here after an event manager marks your approved volunteering complete." now={now} />
          <VolunteerGroup title="Past records" applications={pastRecords} emptyMessage="No past or rejected records." now={now} />
        </>
      )}
    </main>
  );
}
