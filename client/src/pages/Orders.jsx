import { useState, useEffect } from 'react';
import orderService from '@/services/orderService';
import { Package, Clock, CheckCircle2, ShoppingBag, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderService.getMyOrders();
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Failed to load user orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'fulfilled':
        return <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Fulfilled</span>;
      case 'processing':
        return <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Processing</span>;
      case 'paid':
        return <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Paid</span>;
      case 'cancelled':
        return <span className="bg-destructive/10 text-destructive border border-destructive/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Cancelled</span>;
      default:
        return <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Pending</span>;
    }
  };

  return (
    <main className="min-h-screen py-12 px-4 md:px-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Purchases</span>
          <h1 className="text-3xl md:text-4xl font-extrabold mt-1">My Merch Orders</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track club merchandise purchases and pickup status.
          </p>
        </div>

        <Link to="/merch">
          <Button className="rounded-full">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Browse Store
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm font-medium">Fetching order history...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-dashed border-border p-8 mt-8 space-y-4">
          <Package className="mx-auto h-12 w-12 text-muted-foreground/60" />
          <h3 className="text-xl font-bold">No orders placed yet</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            You haven't purchased any club merchandise yet. Visit the merch store to grab your gear!
          </p>
          <Link to="/merch">
            <Button className="rounded-full px-6">Shop Merch</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6 mt-8">
          {orders.map((order) => {
            const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

            return (
              <div
                key={order._id}
                className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4 transition-all hover:border-foreground/30"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="font-mono text-base font-extrabold text-foreground">{order.orderNumber}</span>
                      <p className="text-xs text-muted-foreground">Ordered on {date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    <span className="text-xl font-extrabold text-foreground">${order.totalAmount?.toFixed(2)}</span>
                  </div>
                </div>

                <div className="divide-y divide-border">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-muted overflow-hidden shrink-0">
                          <img
                            src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop'}
                            alt={item.titleSnapshot}
                            className="h-full w-full object-cover"
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop'; }}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{item.titleSnapshot || item.product?.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Variant: {item.variantSnapshot?.size ? `Size ${item.variantSnapshot.size}` : ''} {item.variantSnapshot?.color ? `(${item.variantSnapshot.color})` : ''} · Qty: {item.quantity}
                          </p>
                        </div>
                      </div>

                      <span className="text-sm font-semibold">${((item.priceSnapshot || 0) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
