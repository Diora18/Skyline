import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '@/context/AuthContext';
import ticketService from '@/services/ticketService';
import { Calendar, Clock, MapPin, Ticket, CheckCircle2, Loader2, AlertCircle, X, ShieldCheck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import volunteerService from '@/services/volunteerService';
import { AlumniSocialLinks } from './alumni-social-links';

export function EventDetailModal({ event, onClose, onTicketPurchased }: any) {
  const { user, token, isMember } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [purchasedTicket, setPurchasedTicket] = useState<any>(null);
  const [volunteerApplication, setVolunteerApplication] = useState<any | null>(null);
  const [volunteerLoading, setVolunteerLoading] = useState(false);
  const [volunteerError, setVolunteerError] = useState('');
  const [applying, setApplying] = useState(false);
  const [currentTime] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    const loadApplication = async () => {
      if (!token || !user?._id || !event?._id) {
        setVolunteerApplication(null);
        setVolunteerLoading(false);
        return;
      }
      setVolunteerLoading(true);
      setVolunteerError('');
      try {
        const response = await volunteerService.getMyApplications();
        const application = (response.data?.applications || []).find(
          (item: any) => String(item.event?._id || item.event) === String(event._id)
        );
        if (!cancelled) setVolunteerApplication(application || null);
      } catch (loadError: any) {
        if (!cancelled) setVolunteerError(loadError.message || 'Unable to load this event’s volunteer application.');
      } finally {
        if (!cancelled) setVolunteerLoading(false);
      }
    };
    loadApplication();
    return () => { cancelled = true; };
  }, [event?._id, token, user?._id]);

  if (!event) return null;

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const price = isMember ? event.memberPrice : event.nonMemberPrice;
  const isSoldOut = event.capacity !== null && event.ticketsSold >= event.capacity;
  const canApplyToVolunteer = event.status === 'published' && startDate.getTime() > currentTime;
  const isAlumniEvent = /alumni/i.test(event.title || '');

  const handlePurchase = async () => {
    if (!token || !user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await ticketService.purchaseTicket(event._id);
      setPurchasedTicket(res.data.ticket);
      if (onTicketPurchased) onTicketPurchased(event._id);
    } catch (err: any) {
      setError(err.message || 'Failed to register for event.');
    } finally {
      setLoading(false);
    }
  };

  const handleVolunteerApplication = async () => {
    if (!token || !user) {
      navigate('/login');
      return;
    }

    setApplying(true);
    setVolunteerError('');
    try {
      const response = await volunteerService.applyForEvent(event._id);
      setVolunteerApplication(response.data.application);
    } catch (applyError: any) {
      if (applyError.status === 409) {
        try {
          const response = await volunteerService.getMyApplications();
          const existing = (response.data?.applications || []).find(
            (item: any) => String(item.event?._id || item.event) === String(event._id)
          );
          if (existing) {
            setVolunteerApplication(existing);
            return;
          }
        } catch (refreshError: any) {
          setVolunteerError(refreshError.message || 'Unable to refresh your application status.');
          return;
        }
      }
      setVolunteerError(applyError.message || 'Unable to apply to volunteer for this event.');
    } finally {
      setApplying(false);
    }
  };

  const volunteerStatusText: Record<string, string> = {
    pending: 'Application Pending',
    approved: 'Volunteer — Approved',
    rejected: 'Application Rejected',
    completed: 'Completed',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-xl text-card-foreground">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {purchasedTicket ? (
          <div className="text-center py-4 space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-extrabold">You're Registered!</h3>
            <p className="text-sm text-muted-foreground">
              Your ticket for <span className="font-semibold text-foreground">{event.title}</span> has been confirmed.
            </p>

            <div className="my-6 rounded-2xl border-2 border-dashed border-primary/40 bg-muted/50 p-4">
              <span className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Ticket Code</span>
              <p className="text-2xl font-mono font-extrabold text-primary mt-1">{purchasedTicket.ticketCode}</p>
              <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Show this QR code at the door for entry</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button className="rounded-full w-full" onClick={() => navigate('/tickets')}>
                View My Tickets Wallet
              </Button>
              <Button variant="ghost" className="rounded-full w-full" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {event.bannerImage && (
              <img
                src={event.bannerImage}
                alt={event.title}
                className="h-44 w-full object-cover rounded-2xl"
              />
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold uppercase tracking-wider">
                  {event.category}
                </span>
                {event.capacity && (
                  <span className="text-xs text-muted-foreground">
                    {event.ticketsSold}/{event.capacity} spots filled
                  </span>
                )}
              </div>
              <h2 className="mt-2 text-2xl font-extrabold">{event.title}</h2>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {event.description || 'Join us for this exciting Skyline SSA event! Network, learn, and collaborate with peers.'}
            </p>

            {isAlumniEvent && (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4">
                <div>
                  <p className="text-sm font-semibold">Stay connected with Skyline alumni</p>
                  <p className="mt-1 text-xs text-muted-foreground">Search public profiles and alumni discussions.</p>
                </div>
                <AlumniSocialLinks />
              </div>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Clock className="h-4 w-4 text-primary" />
                <span>{formattedTime}</span>
              </div>
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{event.venue}{event.address ? `, ${event.address}` : ''}</span>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">Volunteer for this event</p>
                  {volunteerApplication ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {volunteerStatusText[volunteerApplication.status] || volunteerApplication.status}
                      {volunteerApplication.responsibility ? ` · ${volunteerApplication.responsibility}` : ''}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Apply to this event separately from your other event applications.
                    </p>
                  )}
                </div>
                {volunteerLoading ? (
                  <Loader2 className="size-5 animate-spin text-primary" aria-label="Checking volunteer application" />
                ) : volunteerApplication?.status === 'pending' ? (
                  <Button type="button" variant="outline" disabled className="rounded-full">Application Pending</Button>
                ) : volunteerApplication?.status === 'approved' ? (
                  <Button type="button" variant="outline" disabled className="rounded-full">Volunteer — Approved</Button>
                ) : volunteerApplication?.status === 'completed' ? (
                  <Button type="button" variant="outline" disabled className="rounded-full">Completed</Button>
                ) : volunteerApplication?.status === 'rejected' ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-destructive">Application Rejected</span>
                    {canApplyToVolunteer && (
                      <Button type="button" onClick={handleVolunteerApplication} disabled={applying} className="rounded-full">
                        Apply again
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button
                    type="button"
                    onClick={handleVolunteerApplication}
                    disabled={!canApplyToVolunteer || applying}
                    className="rounded-full"
                  >
                    {applying ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Users className="mr-2 size-4" />}
                    {applying ? 'Submitting...' : !token ? 'Sign in to apply' : 'Apply as Volunteer'}
                  </Button>
                )}
              </div>
              {volunteerError && (
                <p className="mt-3 text-sm text-destructive" role="alert">{volunteerError}</p>
              )}
              {!canApplyToVolunteer && !volunteerApplication && !volunteerLoading && (
                <p className="mt-2 text-xs text-muted-foreground">Applications are available for upcoming published events.</p>
              )}
            </div>

            <div className="rounded-2xl bg-muted/60 p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block">Ticket prices</span>
                <span className={`mt-1 block text-sm font-bold ${isMember ? 'text-emerald-600' : ''}`}>
                  Member: {event.memberPrice === 0 ? 'Free' : `$${event.memberPrice}`}
                  {isMember ? ' · Your price' : ''}
                </span>
                <span className={`block text-sm font-bold ${!isMember ? 'text-emerald-600' : ''}`}>
                  Non-member: {event.nonMemberPrice === 0 ? 'Free' : `$${event.nonMemberPrice}`}
                  {!isMember ? ' · Your price' : ''}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block">Status</span>
                <span className={`text-sm font-bold ${isSoldOut ? 'text-destructive' : 'text-emerald-500'}`}>
                  {isSoldOut ? 'Sold Out' : 'Registration Open'}
                </span>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2 flex items-center gap-3">
              <Button
                onClick={handlePurchase}
                disabled={loading || isSoldOut}
                className="flex-1 rounded-full h-11 text-base font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : isSoldOut ? (
                  'Sold Out'
                ) : !token ? (
                  'Sign In to RSVP'
                ) : (
                  <>
                    <Ticket className="h-4 w-4 mr-2" />
                    {price === 0 ? 'Claim Free Ticket' : `Purchase Ticket ($${price})`}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
