import { useState, useEffect } from 'react';
import ticketService from '@/services/ticketService';
import { QRCodeSVG } from 'qrcode.react';
import { Ticket, Calendar, MapPin, CheckCircle, AlertTriangle, Loader2, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('valid');
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await ticketService.getMyTickets();
      setTickets(res.data.tickets || []);
    } catch (err) {
      console.error('Failed to load user tickets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter((t) => {
    if (activeTab === 'valid') return t.status === 'valid';
    if (activeTab === 'used') return t.status === 'used';
    return true;
  });

  return (
    <main className="min-h-screen py-12 px-4 md:px-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Member Wallet</span>
          <h1 className="text-3xl md:text-4xl font-extrabold mt-1">My Digital Tickets</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Access your scannable QR codes for fast door check-in at club events.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-muted p-1 rounded-full text-sm font-semibold">
          <button
            onClick={() => setActiveTab('valid')}
            className={`px-4 py-1.5 rounded-full transition-colors ${
              activeTab === 'valid' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab('used')}
            className={`px-4 py-1.5 rounded-full transition-colors ${
              activeTab === 'used' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Used
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1.5 rounded-full transition-colors ${
              activeTab === 'all' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All History
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm font-medium">Fetching your ticket wallet...</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-dashed border-border p-8 mt-8">
          <Ticket className="mx-auto h-12 w-12 text-muted-foreground/60 mb-3" />
          <h3 className="text-xl font-bold">No tickets found</h3>
          <p className="text-muted-foreground text-sm mt-1 max-w-sm mx-auto">
            {activeTab === 'valid'
              ? "You don't have any active event tickets right now. Explore upcoming events to RSVP!"
              : "No tickets found matching this filter."}
          </p>
          <Button className="mt-6 rounded-full" onClick={() => window.location.href = '/events'}>
            Browse Events
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
          {filteredTickets.map((ticket) => {
            const event = ticket.event || {};
            const startDate = event.startDate ? new Date(event.startDate) : null;
            const formattedDate = startDate
              ? startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
              : 'TBD';
            const formattedTime = startDate
              ? startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '';

            const isValid = ticket.status === 'valid';

            return (
              <div
                key={ticket._id}
                className="group relative flex flex-col justify-between rounded-3xl border border-border bg-card overflow-hidden transition-all hover:shadow-lg hover:border-foreground/40"
              >
                <div>
                  <div className="relative h-36 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20 p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-background/90 backdrop-blur px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                        {event.category || 'Event'}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                          isValid
                            ? 'bg-emerald-500 text-white'
                            : ticket.status === 'used'
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-destructive text-destructive-foreground'
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </div>

                    <span className="font-mono text-sm font-bold tracking-widest text-foreground/80 bg-background/80 backdrop-blur px-2.5 py-1 rounded-lg w-fit">
                      {ticket.ticketCode}
                    </span>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-extrabold leading-snug">{event.title || 'Skyline Event'}</h3>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {ticket.ticketType === 'member' ? 'Member Ticket' : 'General Admission'} · ${ticket.price}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary shrink-0" />
                        <span>{formattedDate} {formattedTime ? `at ${formattedTime}` : ''}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary shrink-0" />
                        <span className="truncate">{event.venue || 'Skyline Campus'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Button
                    onClick={() => setSelectedTicket(ticket)}
                    variant={isValid ? 'default' : 'secondary'}
                    className="w-full rounded-full font-semibold"
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    View Pass & QR Code
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket QR Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6 text-card-foreground shadow-2xl space-y-6 text-center">
            <div>
              <span className="text-xs uppercase font-bold text-primary tracking-widest">Entry Pass</span>
              <h3 className="text-2xl font-extrabold mt-1">{selectedTicket.event?.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{selectedTicket.event?.venue}</p>
            </div>

            <div className="mx-auto w-fit bg-white p-4 rounded-2xl shadow-inner border border-border">
              <QRCodeSVG
                value={selectedTicket.ticketCode}
                size={180}
                bgColor="#FFFFFF"
                fgColor="#000000"
                level="H"
              />
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Ticket Code</span>
              <p className="text-xl font-mono font-extrabold text-foreground tracking-widest">
                {selectedTicket.ticketCode}
              </p>
              <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                {selectedTicket.status === 'valid' ? (
                  <span className="text-emerald-500 font-semibold flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" /> Ready for Scanner Check-In
                  </span>
                ) : (
                  <span className="text-muted-foreground flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" /> Checked in at {selectedTicket.checkedInAt ? new Date(selectedTicket.checkedInAt).toLocaleTimeString() : 'door'}
                  </span>
                )}
              </div>
            </div>

            <Button className="w-full rounded-full" variant="outline" onClick={() => setSelectedTicket(null)}>
              Close Pass
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
