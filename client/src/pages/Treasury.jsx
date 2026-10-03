import { useState, useEffect } from 'react';
import treasuryService from '@/services/treasuryService';
import { DollarSign, ArrowUpRight, ArrowDownRight, Wallet, Receipt, Plus, Loader2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Treasury() {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  // Manual Transaction Form
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState('income');
  const [category, setCategory] = useState('other');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, txRes] = await Promise.all([
        treasuryService.getSummary(),
        treasuryService.getTransactions(filterType !== 'all' ? { type: filterType } : {}),
      ]);
      setSummary(sumRes.data);
      setTransactions(txRes.data.transactions || []);
    } catch (err) {
      console.error('Failed to load treasury data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterType]);

  const handleManualTransaction = async (e) => {
    e.preventDefault();
    if (!amount || !description) return;

    setSubmitting(true);
    try {
      await treasuryService.createManualTransaction({
        type,
        category,
        amount: Number(amount),
        description,
      });
      setShowModal(false);
      setAmount('');
      setDescription('');
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to record transaction');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen py-12 px-4 md:px-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Executive Operations</span>
          <h1 className="text-3xl md:text-4xl font-extrabold mt-1">Club Treasury & Financial Ledger</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time financial summary, automated income/expense tracking, and audit ledger.
          </p>
        </div>

        <Button onClick={() => setShowModal(true)} className="rounded-full">
          <Plus className="h-4 w-4 mr-2" />
          Record Adjustment
        </Button>
      </div>

      {/* Financial Summary Cards */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm font-medium">Aggregating treasury stats...</p>
        </div>
      ) : (
        <div className="space-y-8 mt-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Net Balance</span>
                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                  <Wallet className="h-5 w-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-foreground mt-3">${summary?.netBalance?.toFixed(2) || '0.00'}</p>
              <span className="text-xs text-emerald-500 font-semibold mt-1 block">Live Audited Liquidity</span>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Income</span>
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-foreground mt-3">${summary?.totalIncome?.toFixed(2) || '0.00'}</p>
              <span className="text-xs text-muted-foreground mt-1 block">Tickets, Merch, Dues</span>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Expenses</span>
                <div className="p-2.5 rounded-2xl bg-destructive/10 text-destructive">
                  <ArrowDownRight className="h-5 w-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-foreground mt-3">${summary?.totalExpense?.toFixed(2) || '0.00'}</p>
              <span className="text-xs text-muted-foreground mt-1 block">Reimbursements & Operations</span>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Members</span>
                <div className="p-2.5 rounded-2xl bg-accent/20 text-accent-foreground">
                  <Receipt className="h-5 w-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-foreground mt-3">{summary?.activeMembersCount || 0}</p>
              <span className="text-xs text-muted-foreground mt-1 block">Dues Paid Students</span>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <h3 className="text-xl font-extrabold">Transaction Ledger</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${filterType === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType('income')}
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${filterType === 'income' ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground'}`}
                >
                  Income
                </button>
                <button
                  onClick={() => setFilterType('expense')}
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${filterType === 'expense' ? 'bg-destructive text-white' : 'bg-muted text-muted-foreground'}`}
                >
                  Expense
                </button>
              </div>
            </div>

            <div className="divide-y divide-border">
              {transactions.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No ledger transactions found.</p>
              ) : (
                transactions.map((tx) => (
                  <div key={tx._id} className="py-3 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'}`}>
                        {tx.type === 'income' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{tx.description}</p>
                        <span className="text-xs text-muted-foreground uppercase font-semibold">
                          {tx.category?.replace('_', ' ')} · {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : ''}
                        </span>
                      </div>
                    </div>

                    <span className={`text-base font-mono font-extrabold ${tx.type === 'income' ? 'text-emerald-500' : 'text-destructive'}`}>
                      {tx.type === 'income' ? '+' : '-'}${tx.amount?.toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl text-card-foreground">
            <h3 className="text-2xl font-extrabold">Manual Financial Entry</h3>
            <p className="text-xs text-muted-foreground mt-1">Record manual cash income or operational expense.</p>

            <form onSubmit={handleManualTransaction} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="income">Income (+ Cash Inflow)</option>
                  <option value="expense">Expense (- Cash Outflow)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="dues">Membership Dues</option>
                  <option value="ticket_sale">Ticket Sale</option>
                  <option value="merch_sale">Merch Sale</option>
                  <option value="event_supplies">Event Supplies</option>
                  <option value="food_catering">Food & Catering</option>
                  <option value="other">Other Adjustment</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Amount ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Description / Memo</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cash collected at pizza social"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)} className="rounded-full">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="rounded-full">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Record Entry'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
