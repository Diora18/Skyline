import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import ticketService from '@/services/ticketService';
import eventService from '@/services/eventService';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, CheckCircle2, AlertTriangle, XCircle, Loader2, Camera, KeyRound, RefreshCw, Users, MapPin, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Scanner() {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('eventId');
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [eventLoading, setEventLoading] = useState(Boolean(eventId));
  const [eventContextError, setEventContextError] = useState('');
  const [eventContext, setEventContext] = useState(null);
  const [eventTickets, setEventTickets] = useState([]);
  const [scanResult, setScanResult] = useState({ type: null, message: '', data: null });

  const scannerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    if (!eventId) {
      setEventContext(null);
      setEventTickets([]);
      setEventLoading(false);
      setEventContextError('');
      return () => { cancelled = true; };
    }

    setEventContext(null);
    setEventTickets([]);
    setEventLoading(true);
    setEventContextError('');

    Promise.all([
      eventService.getEventById(eventId),
      ticketService.getEventTickets(eventId),
    ]).then(([eventResponse, ticketsResponse]) => {
      if (cancelled) return;
      setEventContext(eventResponse.data?.event || null);
      setEventTickets(ticketsResponse.data?.tickets || []);
    }).catch((error) => {
      if (!cancelled) {
        setEventContextError(error.message || 'Unable to load this event’s ticket list.');
      }
    }).finally(() => {
      if (!cancelled) setEventLoading(false);
    });

    return () => { cancelled = true; };
  }, [eventId]);

  const processTicketCode = async (code) => {
    if (!code || loading || eventLoading || eventContextError) return;
    const cleanCode = code.trim().toUpperCase();

    if (eventId && !eventTickets.some((ticket) => String(ticket.ticketCode || '').toUpperCase() === cleanCode)) {
      setScanResult({
        type: 'error',
        message: 'This ticket is not listed for the selected event.',
        data: null,
      });
      return;
    }

    setLoading(true);
    try {
      const res = await ticketService.scanTicket(cleanCode);
      setScanResult({
        type: 'success',
        message: res.message || 'Valid Ticket! Admission Granted.',
        data: res.data,
      });
      if (eventId && res.data?.ticket) {
        setEventTickets((current) => current.map((ticket) =>
          ticket.ticketCode === cleanCode ? { ...ticket, ...res.data.ticket } : ticket
        ));
      }
    } catch (err) {
      if (err.data?.checkedInAt) {
        setScanResult({
          type: 'warning',
          message: err.message || 'Ticket already used!',
          data: err.data,
        });
      } else {
        setScanResult({
          type: 'error',
          message: err.message || 'Invalid or unverified ticket code.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const startCameraScanner = () => {
    setScanning(true);
    setScanResult({ type: null, message: '' });

    setTimeout(() => {
      if (!scannerRef.current) {
        const scanner = new Html5QrcodeScanner(
          'qr-reader',
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );

        scanner.render(
          (decodedText) => {
            scanner.clear();
            scannerRef.current = null;
            setScanning(false);
            processTicketCode(decodedText);
          },
          () => {}
        );

        scannerRef.current = scanner;
      }
    }, 100);
  };

  const stopCameraScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, []);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    processTicketCode(manualCode);
  };

  const resetResult = () => {
    setScanResult({ type: null, message: '' });
    setManualCode('');
  };

  const checkedInCount = eventTickets.filter((ticket) => ticket.status === 'used').length;
  const eventDate = eventContext?.startDate
    ? new Date(eventContext.startDate).toLocaleDateString(undefined, { dateStyle: 'medium' })
    : '';

  return (
    <main className="min-h-screen w-full max-w-4xl mx-auto py-12 px-4 md:px-6">
      <div className="border-b border-border pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-primary">Door Operations</span>
        <h1 className="mt-2 text-3xl md:text-4xl font-extrabold">
          {eventContext ? `${eventContext.title} check-in` : 'Event Door QR Scanner'}
        </h1>
        <p className="mt-2 text-muted-foreground text-sm max-w-2xl">
          Scan attendee QR codes or enter a ticket code to verify admission.
        </p>
      </div>

      {eventId && (
        <section className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4 md:p-5" aria-live="polite">
          {eventLoading ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading event access and ticket list...
            </p>
          ) : eventContextError ? (
            <p role="alert" className="text-sm font-medium text-destructive">{eventContextError}</p>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-bold">{eventContext?.title}</p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {eventDate && <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5" />{eventDate}</span>}
                  {eventContext?.venue && <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" />{eventContext.venue}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-background px-4 py-2 text-sm font-semibold">
                <Users className="size-4 text-primary" />
                {checkedInCount} / {eventTickets.length} checked in
              </div>
            </div>
          )}
        </section>
      )}

      <div className="mt-8 space-y-6">
        {scanResult.type && (
          <div
            className={`rounded-3xl p-6 border-2 text-center space-y-4 shadow-lg transition-all animate-in fade-in zoom-in ${
              scanResult.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-950 dark:text-emerald-100'
                : scanResult.type === 'warning'
                ? 'bg-amber-500/10 border-amber-500/50 text-amber-950 dark:text-amber-100'
                : 'bg-destructive/10 border-destructive/50 text-destructive'
            }`}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-background shadow-md">
              {scanResult.type === 'success' && <CheckCircle2 className="h-10 w-10 text-emerald-500" />}
              {scanResult.type === 'warning' && <AlertTriangle className="h-10 w-10 text-amber-500" />}
              {scanResult.type === 'error' && <XCircle className="h-10 w-10 text-destructive" />}
            </div>

            <div>
              <h3 className="text-2xl font-extrabold">{scanResult.message}</h3>
              {scanResult.data?.attendeeName && (
                <p className="text-lg font-semibold mt-1">Attendee: {scanResult.data.attendeeName}</p>
              )}
              {scanResult.data?.eventTitle && (
                <p className="text-xs font-medium text-muted-foreground mt-0.5">Event: {scanResult.data.eventTitle}</p>
              )}
            </div>

            <Button onClick={resetResult} className="rounded-full px-6 shadow">
              <RefreshCw className="h-4 w-4 mr-2" />
              Scan Next Ticket
            </Button>
          </div>
        )}

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Camera Scanner</h2>
            </div>
            {scanning && (
              <Button variant="ghost" size="sm" onClick={stopCameraScanner} className="rounded-full text-xs">
                Stop Camera
              </Button>
            )}
          </div>

          {!scanning ? (
            <div className="text-center py-10 bg-muted/40 rounded-2xl border border-dashed border-border space-y-4">
              <QrCode className="mx-auto h-12 w-12 text-muted-foreground/60" />
              <p className="text-sm text-muted-foreground">Turn on camera to scan QR passes in real time.</p>
              <Button onClick={startCameraScanner} disabled={eventLoading || Boolean(eventContextError)} className="rounded-full">
                <Camera className="h-4 w-4 mr-2" />
                Launch Camera Scanner
              </Button>
            </div>
          ) : (
            <div id="qr-reader" className="w-full overflow-hidden rounded-2xl border border-primary/30" />
          )}
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Manual Ticket Lookup</h2>
          </div>

          <form onSubmit={handleManualSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="e.g. TKT-2026-0001"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="flex-1 rounded-full border border-input bg-background px-4 py-2.5 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button type="submit" disabled={loading || eventLoading || Boolean(eventContextError) || !manualCode.trim()} className="rounded-full px-6 font-semibold">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Verify Entry'}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
