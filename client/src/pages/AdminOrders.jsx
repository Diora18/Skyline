import { useState, useEffect } from 'react';
import orderService from '@/services/orderService';
import { PackageCheck, Clock, CheckCircle2, ShieldCheck, Loader2, Filter, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderService.getAllOrders(filter !== 'all' ? { status: filter } : {});
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Failed to load all orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      await fetchOrders();
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const statusOptions = ['all', 'pending', 'paid', 'processing', 'fulfilled', 'cancelled'];

  return (
    <main className="min-h-screen py-12 px-4 md:px-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Executive Operations</span>
          <h1 className="text-3xl md:text-4xl font-extrabold mt-1">Order Fulfillment Queue</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage student merchandise orders and update fulfillment lifecycle states.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {statusOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                filter === opt
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm font-medium">Loading orders queue...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-dashed border-border p-8 mt-8">
          <PackageCheck className="mx-auto h-12 w-12 text-muted-foreground/60 mb-3" />
          <h3 className="text-xl font-bold">No orders found</h3>
          <p className="text-muted-foreground text-sm mt-1">No orders matching current status filter: <span className="font-semibold text-foreground uppercase">{filter}</span>.</p>
        </div>
      ) : (
        <div className="space-y-6 mt-8">
          {orders.map((order) => {
            const user = order.user || {};
            const isUpdating = updatingId === order._id;

            return (
              <div
                key={order._id}
                className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-lg font-extrabold text-foreground">{order.orderNumber}</span>
                      <span className="rounded-full bg-primary/10 text-primary px-3 py-0.5 text-xs font-bold uppercase tracking-wider">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Customer: <span className="font-semibold text-foreground">{user.name || 'Student'}</span> ({user.email || 'No email'}) · Student ID: {user.studentId || 'N/A'}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-foreground">${order.totalAmount?.toFixed(2)}</span>
                    <p className="text-xs text-muted-foreground">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}
                    </p>
                  </div>
                </div>

                {/* Items List */}
                <div className="divide-y divide-border">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-sm">
                      <div>
                        <span className="font-bold">{item.titleSnapshot}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          (Variant: {item.variantSnapshot?.size ? `Size ${item.variantSnapshot.size}` : ''} {item.variantSnapshot?.color ? `[${item.variantSnapshot.color}]` : ''} · Qty: {item.quantity})
                        </span>
                      </div>
                      <span className="font-semibold">${((item.priceSnapshot || 0) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Admin Pipeline Action Controls */}
                <div className="pt-2 flex flex-wrap items-center justify-end gap-2 border-t border-border">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-auto">Advance Pipeline:</span>

                  {order.status !== 'paid' && order.status !== 'fulfilled' && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isUpdating}
                      onClick={() => handleStatusChange(order._id, 'paid')}
                      className="rounded-full text-xs"
                    >
                      Mark as Paid
                    </Button>
                  )}

                  {order.status !== 'processing' && order.status !== 'fulfilled' && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isUpdating}
                      onClick={() => handleStatusChange(order._id, 'processing')}
                      className="rounded-full text-xs"
                    >
                      Mark Processing
                    </Button>
                  )}

                  {order.status !== 'fulfilled' && (
                    <Button
                      size="sm"
                      disabled={isUpdating}
                      onClick={() => handleStatusChange(order._id, 'fulfilled')}
                      className="rounded-full text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Fulfill Order
                    </Button>
                  )}

                  {order.status !== 'cancelled' && order.status !== 'fulfilled' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isUpdating}
                      onClick={() => handleStatusChange(order._id, 'cancelled')}
                      className="rounded-full text-xs text-destructive hover:bg-destructive/10"
                    >
                      Cancel Order
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
