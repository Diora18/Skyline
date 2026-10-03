import { useState, useEffect } from 'react';
import expenseService from '@/services/expenseService';
import { Receipt, CheckCircle2, XCircle, Clock, DollarSign, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actionId, setActionId] = useState(null);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await expenseService.getAllExpenses(filter !== 'all' ? { status: filter } : {});
      setExpenses(res.data.expenses || []);
    } catch (err) {
      console.error('Failed to load expense review queue', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [filter]);

  const handleReview = async (id, status) => {
    setActionId(id);
    try {
      await expenseService.reviewExpense(id, status);
      await fetchExpenses();
    } catch (err) {
      alert(err.message || 'Failed to review claim');
    } finally {
      setActionId(null);
    }
  };

  const handleReimburse = async (id) => {
    setActionId(id);
    try {
      await expenseService.reimburseExpense(id);
      await fetchExpenses();
    } catch (err) {
      alert(err.message || 'Failed to process reimbursement');
    } finally {
      setActionId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'reimbursed':
        return <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Reimbursed</span>;
      case 'approved':
        return <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Approved</span>;
      case 'rejected':
        return <span className="bg-destructive/10 text-destructive px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Rejected</span>;
      default:
        return <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Pending Review</span>;
    }
  };

  return (
    <main className="min-h-screen py-12 px-4 md:px-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Executive Operations</span>
          <h1 className="text-3xl md:text-4xl font-extrabold mt-1">Expense Claims Queue</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review volunteer expense claims and issue audited cash reimbursements.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {['all', 'submitted', 'approved', 'reimbursed', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                filter === st ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm font-medium">Fetching expense claims...</p>
        </div>
      ) : expenses.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-dashed border-border p-8 mt-8">
          <Receipt className="mx-auto h-12 w-12 text-muted-foreground/60 mb-3" />
          <h3 className="text-xl font-bold">No expense claims</h3>
          <p className="text-muted-foreground text-sm mt-1">No claims matching filter: <span className="font-semibold text-foreground uppercase">{filter}</span>.</p>
        </div>
      ) : (
        <div className="space-y-6 mt-8">
          {expenses.map((expense) => {
            const submitter = expense.submittedBy || {};
            const isProcessing = actionId === expense._id;

            return (
              <div key={expense._id} className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-extrabold">Expense claim</h3>
                      {getStatusBadge(expense.status)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted by: <span className="font-semibold text-foreground">{submitter.name || 'User'}</span> ({submitter.email}) · Category: <span className="uppercase font-semibold">{expense.category}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-3xl font-extrabold text-foreground">${expense.amount?.toFixed(2)}</span>
                    <p className="text-xs text-muted-foreground">
                      {expense.createdAt ? new Date(expense.createdAt).toLocaleDateString() : ''}
                    </p>
                  </div>
                </div>

                {expense.description && (
                  <p className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-2xl">
                    {expense.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  {expense.receiptUrl ? (
                    <a
                      href={expense.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> View Uploaded Receipt
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No receipt file attached</span>
                  )}

                  <div className="flex items-center gap-2">
                    {expense.status === 'submitted' && (
                      <>
                        <Button
                          size="sm"
                          disabled={isProcessing}
                          onClick={() => handleReview(expense._id, 'approve')}
                          className="rounded-full text-xs"
                        >
                          Approve Claim
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={isProcessing}
                          onClick={() => handleReview(expense._id, 'reject')}
                          className="rounded-full text-xs text-destructive hover:bg-destructive/10"
                        >
                          Reject
                        </Button>
                      </>
                    )}

                    {expense.status === 'approved' && (
                      <Button
                        size="sm"
                        disabled={isProcessing}
                        onClick={() => handleReimburse(expense._id)}
                        className="rounded-full text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <DollarSign className="h-3.5 w-3.5 mr-1" />
                        Disburse Cash & Log Ledger
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
