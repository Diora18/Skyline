import { useState, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import ticketService from '@/services/ticketService';
import { Calendar, Clock, MapPin, Ticket, CheckCircle2, Loader2, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function EventDetailModal({ event, onClose, onTicketPurchased }: any) {
  const { user, token, isMember } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [purchasedTicket, setPurchasedTicket] = useState<any>(null);

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

            <div className="rounded-2xl bg-muted/60 p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block">Price</span>
                <span className="text-lg font-bold">
                  {price === 0 ? 'FREE' : `$${price}`}
                </span>
                {isMember ? (
                  <span className="text-xs text-emerald-500 font-semibold block">Member price applied</span>
                ) : (
                  <span className="text-xs text-muted-foreground block">
                    (Member price: {event.memberPrice === 0 ? 'FREE' : `$${event.memberPrice}`})
                  </span>
                )}
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
