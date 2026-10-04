import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import expenseService from '@/services/expenseService';
import eventService from '@/services/eventService';
import projectService from '@/services/projectService';
import { CheckCircle2, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';

export default function ExpenseSubmit() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('supplies');
  const [description, setDescription] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [projects, setProjects] = useState([]);
  const [linkedProject, setLinkedProject] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [eventId, setEventId] = useState(searchParams.get('eventId') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      projectService.getProjects(),
      eventService.getMyVolunteerAssignments(),
    ])
      .then(([projectResponse, assignmentResponse]) => {
        setProjects(projectResponse.data.projects || []);
        const approvedAssignments = assignmentResponse.data.applications || [];
        setAssignments(approvedAssignments);
        if (!eventId && approvedAssignments.length === 1) {
          setEventId(approvedAssignments[0].event?._id || '');
        }
      })
      .catch((err) => setError(err.message || 'Failed to load expense options.'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !amount) return;

    setLoading(true);
    setError('');

    try {
      await expenseService.submitExpense({
        amount: Number(amount),
        category,
        description: [title, description].filter(Boolean).join('\n\n'),
        eventId: eventId || null,
        receiptUrl,
        linkedProject: linkedProject || null,
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
      <Link to="/projects" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Workspace
      </Link>

      <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Financial Operations</span>
          <h1 className="text-2xl md:text-3xl font-extrabold">Submit Expense Claim</h1>
          <p className="text-xs text-muted-foreground">
            Submit receipts for event supplies, catering, or club purchases to receive officer reimbursement.
          </p>
        </div>

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
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="supplies">Supplies</option>
                  <option value="food">Food</option>
                  <option value="decorations">Decorations</option>
                  <option value="transport">Transport</option>
                  <option value="venue">Venue</option>
                  <option value="other">Other</option>
                </select>
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

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Event</label>
              <select
                required={assignments.length > 0}
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select an approved event</option>
                {assignments.map((assignment) => (
                  <option key={assignment._id} value={assignment.event?._id}>{assignment.event?.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Related Project</label>
              <select
                value={linkedProject}
                onChange={(e) => setLinkedProject(e.target.value)}
                className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Not linked to a project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>{project.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Receipt Image URL (Optional)</label>
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

            <Button type="submit" disabled={loading} className="w-full rounded-full h-11 text-base font-semibold mt-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Submit Reimbursement Claim'}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
