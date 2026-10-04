import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import expenseService from '@/services/expenseService';
import projectService from '@/services/projectService';
import eventService from '@/services/eventService';
import { CheckCircle2, Loader2, AlertCircle, ArrowLeft, CalendarDays, ReceiptText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CustomSelect } from '@/components/ui/custom-select';

export default function ExpenseSubmit() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('eventId');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('supplies');
  const [description, setDescription] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [projects, setProjects] = useState([]);
  const [linkedProject, setLinkedProject] = useState('');
  const [eventContext, setEventContext] = useState(null);
  const [eventContextError, setEventContextError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!eventId) {
      projectService.getProjects()
        .then((response) => {
          if (!cancelled) setProjects(response.data.projects || []);
        })
        .catch((err) => {
          if (!cancelled) setError(err.message || 'Failed to load projects.');
        });
    }

    if (eventId) {
      eventService.getEventById(eventId)
        .then((response) => {
          if (cancelled) return;
          const event = response.data?.event;
          setEventContext(event || null);
          if (event) {
            setTitle((current) => current || `Expense for ${event.title}`);
            setLinkedProject(String(event.linkedProject?._id || event.linkedProject || ''));
          }
        })
        .catch((err) => {
          if (!cancelled) setEventContextError(err.message || 'Unable to load the related event.');
        });
    }

    return () => { cancelled = true; };
  }, [eventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (eventId && !eventContext) {
      setError(eventContextError || 'Wait for the related event to load before submitting.');
      return;
    }
    if (!title.trim() || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      setError('Enter a clear claim title and an amount greater than zero.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await expenseService.submitExpense({
        amount: Number(amount),
        category,
        description: [title, description].filter(Boolean).join('\n\n'),
        receiptUrl,
        linkedProject: linkedProject || null,
        ...(eventId ? { event: eventId } : {}),
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to submit expense claim');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen py-12 px-4 md:px-6 max-w-xl mx-auto">
      <Link to={eventId ? '/volunteering' : '/projects'} className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> {eventId ? 'Back to My Volunteering' : 'Back to Workspace'}
      </Link>

      <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Financial Operations</span>
          <h1 className="text-2xl md:text-3xl font-extrabold">Submit Expense Claim</h1>
          <p className="text-xs text-muted-foreground">
            Submit receipts for event supplies, catering, or club purchases to receive officer reimbursement.
          </p>
        </div>

        {eventId && (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
            {eventContext ? (
              <>
                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">Event-related claim</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{eventContext.title}</p>
                  </div>
                </div>
                {eventContext.linkedProject ? (
                  <p className="mt-3 text-xs text-muted-foreground">
                    This claim will be linked directly to the event and its related project.
                  </p>
                ) : (
                  <p className="mt-3 text-xs text-muted-foreground">
                    This claim will be linked directly to the event. Include a receipt URL and itemized description for review.
                  </p>
                )}
              </>
            ) : eventContextError ? (
              <p role="alert" className="text-sm text-destructive">{eventContextError}</p>
            ) : (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Loading event details...
              </p>
            )}
          </div>
        )}

        {success ? (
          <div className="text-center py-6 space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-extrabold">Claim Submitted!</h3>
            <p className="text-sm text-muted-foreground">
              Your claim for <span className="font-semibold text-foreground">${amount}</span> has been submitted to the Treasurer review queue.
            </p>
            <Button className="rounded-full w-full" onClick={() => navigate('/expenses/my')}>
              View My Expense Claims
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Claim Title / Purpose</label>
              <input
                type="text"
                required
                placeholder="e.g. 10x Pizzas for Novahack Social"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Amount ($ USD)</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Category</label>
                <CustomSelect
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="supplies">Supplies</option>
                  <option value="food">Food</option>
                  <option value="decorations">Decorations</option>
                  <option value="transport">Transport</option>
                  <option value="venue">Venue</option>
                  <option value="other">Other</option>
                </CustomSelect>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Description / Breakdown</label>
              <textarea
                rows={3}
                placeholder="Itemized list of items purchased..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            {!eventId && <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Related Project</label>
              <CustomSelect
                value={linkedProject}
                onChange={(e) => setLinkedProject(e.target.value)}
              >
                <option value="">Not linked to a project</option>
                {eventContext?.linkedProject && !projects.some((project) =>
                  String(project._id) === String(eventContext.linkedProject?._id || eventContext.linkedProject)
                ) && (
                  <option value={String(eventContext.linkedProject?._id || eventContext.linkedProject)}>
                    {eventContext.linkedProject?.title || 'Event-linked project'}
                  </option>
                )}
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>{project.title}</option>
                ))}
              </CustomSelect>
            </div>}

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                <ReceiptText className="mr-1 inline size-3.5" /> Receipt Image URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={receiptUrl}
                onChange={(e) => setReceiptUrl(e.target.value)}
                className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" disabled={loading || (Boolean(eventId) && !eventContext)} className="w-full rounded-full h-11 text-base font-semibold mt-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Submit Reimbursement Claim'}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
