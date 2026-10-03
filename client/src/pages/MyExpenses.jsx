import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ExternalLink, Loader2, Receipt } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import expenseService from '@/services/expenseService';
import { useAuth } from '@/hooks/useAuth';

const statusStyles = {
  submitted: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  approved: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  rejected: 'bg-destructive/10 text-destructive',
  reimbursed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
};

export default function MyExpenses() {
  const { canSubmitExpenses } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await expenseService.getMyExpenses();
        setExpenses(response.data.expenses || []);
      } catch (err) {
        setError(err.message || 'Failed to load your expense claims.');
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  return (
    <main className="min-h-screen py-12 px-4 md:px-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Financial Operations</span>
          <h1 className="text-3xl md:text-4xl font-extrabold mt-1">My Expense Claims</h1>
          <p className="text-sm text-muted-foreground mt-1">Track review and reimbursement status for your submitted claims.</p>
        </div>
        {canSubmitExpenses ? (
          <Link to="/expenses/submit" className={buttonVariants({ className: 'rounded-full' })}>
            Submit an Expense
          </Link>
        ) : (
          <Link to="/volunteering" className="text-sm font-semibold text-primary hover:underline">
            View assigned events
          </Link>
        )}
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm font-medium">Loading your claims...</p>
        </div>
      ) : error ? (
        <div className="mt-8 flex items-center gap-2 rounded-xl bg-destructive/10 p-4 text-sm font-semibold text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : expenses.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-border p-10 text-center">
          <Receipt className="mx-auto h-12 w-12 text-muted-foreground/60 mb-3" />
          <h2 className="text-xl font-bold">No expense claims yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">Submitted claims and their status will appear here.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {expenses.map((expense) => (
            <article key={expense._id} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${statusStyles[expense.status] || 'bg-muted text-muted-foreground'}`}>
                    {expense.status}
                  </span>
                  <p className="mt-3 whitespace-pre-line text-sm font-medium">{expense.description}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {expense.category} · {expense.createdAt ? new Date(expense.createdAt).toLocaleDateString() : ''}
                    {expense.event?.title ? ` · Event: ${expense.event.title}` : ''}
                    {expense.linkedProject?.title ? ` · ${expense.linkedProject.title}` : ''}
                  </p>
                </div>
                <span className="text-2xl font-extrabold">${Number(expense.amount || 0).toFixed(2)}</span>
              </div>
              {expense.rejectionReason && (
                <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                  Review note: {expense.rejectionReason}
                </p>
              )}
              {expense.receiptUrl && (
                <a
                  href={expense.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View receipt
                </a>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
