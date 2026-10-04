import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import ticketService from '@/services/ticketService';
import eventService from '@/services/eventService';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, CheckCircle2, AlertTriangle, XCircle, Loader2, Camera, KeyRound, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function Scanner() {
  const { isOfficer } = useAuth();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('eventId') || '';
  const [eventTitle, setEventTitle] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState({ type: null, message: '', data: null });

  const scannerRef = useRef(null);

  useEffect(() => {
    if (!eventId) return;
    eventService.getEventById(eventId)
      .then((response) => setEventTitle(response.data.event?.title || 'Selected event'))
      .catch(() => setEventTitle('Selected event'));
  }, [eventId]);

  const processTicketCode = async (code) => {
    if (!code || loading) return;
    if (!isOfficer && !eventId) {
      setScanResult({
        type: 'error',
        message: 'Open the scanner from a specific managed event before scanning.',
      });
      return;
    }
    const cleanCode = code.trim().toUpperCase();

    setLoading(true);
    try {
      const res = await ticketService.scanTicket(cleanCode, eventId || undefined);
      setScanResult({
        type: 'success',
        message: res.message || 'Valid Ticket! Admission Granted.',
        data: res.data,
      });
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

  return (
    <main className="min-h-screen py-12 px-4 md:px-6 max-w-3xl mx-auto">
      <div className="text-center space-y-2 border-b border-border pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-primary">Door Operations</span>
        <h1 className="text-3xl md:text-4xl font-extrabold">Event Door QR Scanner</h1>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          Scan attendee QR codes or enter 12-digit ticket codes for instant admission verification.
        </p>
        {!isOfficer && !eventId && (
          <p className="mx-auto mt-3 max-w-lg rounded-xl bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-700">
            Select an event from your event manager or volunteer workspace to start scanning.
          </p>
        )}
        {eventTitle && (
          <p className="mx-auto mt-3 inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            Scanning for: {eventTitle}
          </p>
        )}
      </div>

      <div className="mt-8 space-y-8">
        {/* Verification Result Notification Card */}
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

        {/* Camera Scanner View */}
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
              <Button onClick={startCameraScanner} className="rounded-full">
                <Camera className="h-4 w-4 mr-2" />
                Launch Camera Scanner
              </Button>
            </div>
          ) : (
            <div id="qr-reader" className="w-full overflow-hidden rounded-2xl border border-primary/30" />
          )}
        </div>

        {/* Manual Code Input View */}
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
            <Button type="submit" disabled={loading || !manualCode.trim()} className="rounded-full px-6 font-semibold">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Verify Entry'}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
