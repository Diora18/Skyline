import { useState, useEffect, useContext } from 'react';
import productService from '@/services/productService';
import orderService from '@/services/orderService';
import { AuthContext } from '@/context/AuthContext';
import { ShoppingBag, Tag, CheckCircle2, Loader2, AlertCircle, X, Plus, Minus, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Merch() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productService.getProducts();
      setProducts(res.data.products || []);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = ['All', 'Apparel', 'Accessories', 'Stationery', 'Gear'];

  const filteredProducts = products.filter((p) => {
    if (filter === 'All') return true;
    return p.category?.toLowerCase() === filter.toLowerCase();
  });

  return (
    <main className="min-h-screen py-12 px-4 md:px-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Official Store</span>
          <h1 className="text-3xl md:text-5xl font-extrabold mt-1">Skyline SSA Merch</h1>
          <p className="text-muted-foreground text-sm max-w-lg mt-2">
            Rep your club pride with official hoodies, tees, stickers, and gear. Exclusive member discounts applied at checkout.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                filter === cat
                  ? 'bg-foreground text-background shadow-sm'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Catalog Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm font-medium">Loading club store catalog...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-dashed border-border p-8 mt-8">
          <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/60 mb-3" />
          <h3 className="text-xl font-bold">No merch items found</h3>
          <p className="text-muted-foreground text-sm mt-1">Check back soon for new merch drops!</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
          {filteredProducts.map((product) => {
            const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
            const isOutOfStock = totalStock === 0;

            return (
              <div
                key={product._id}
                onClick={() => !isOutOfStock && setSelectedProduct(product)}
                className={`group relative flex flex-col justify-between rounded-3xl border border-border bg-card p-5 transition-all ${
                  isOutOfStock ? 'opacity-60 cursor-not-allowed' : 'hover:border-foreground/50 hover:shadow-xl cursor-pointer'
                }`}
              >
                <div className="space-y-4">
                  <div className="relative h-52 w-full overflow-hidden rounded-2xl bg-muted">
                    <img
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop'}
                      alt={product.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop';
                      }}
                    />
                    <span className="absolute top-3 left-3 rounded-full bg-background/90 backdrop-blur px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary shadow-sm">
                      {product.category}
                    </span>
                    {isOutOfStock && (
                      <span className="absolute top-3 right-3 rounded-full bg-destructive text-destructive-foreground px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-sm">
                        Sold Out
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl font-extrabold group-hover:text-primary transition-colors">{product.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {product.description || 'Premium official Skyline Student Association merchandise.'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold block">Price</span>
                    <span className="text-2xl font-extrabold text-foreground">${product.basePrice}</span>
                  </div>

                  <Button
                    disabled={isOutOfStock}
                    className="rounded-full font-semibold px-5"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isOutOfStock) setSelectedProduct(product);
                    }}
                  >
                    {isOutOfStock ? 'Sold Out' : 'Select Option'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Checkout Modal */}
      {selectedProduct && (
        <ProductCheckoutModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onOrderSuccess={fetchProducts}
        />
      )}
    </main>
  );
}

function ProductCheckoutModal({ product, onClose, onOrderSuccess }) {
  const { user, token, isMember } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);

  const availableStock = selectedVariant ? selectedVariant.stock : 0;
  const totalPrice = (product.basePrice * quantity).toFixed(2);

  const handleOrder = async () => {
    if (!token || !user) {
      navigate('/login');
      return;
    }

    if (!selectedVariant) {
      setError('Please select a product variant (size/color).');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const items = [
        {
          productId: product._id,
          variantSku: selectedVariant.sku,
          quantity,
        },
      ];
      const res = await orderService.createOrder(items);
      setCreatedOrder(res.data.order);
      if (onOrderSuccess) onOrderSuccess();
    } catch (err) {
      setError(err.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl text-card-foreground">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {createdOrder ? (
          <div className="text-center py-4 space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-extrabold">Order Confirmed!</h3>
            <p className="text-sm text-muted-foreground">
              Thank you for ordering <span className="font-semibold text-foreground">{product.title}</span>.
            </p>

            <div className="my-6 rounded-2xl border-2 border-dashed border-primary/40 bg-muted/50 p-5 space-y-2 text-left">
              <div className="flex justify-between text-xs text-muted-foreground font-semibold">
                <span>ORDER NUMBER</span>
                <span className="font-mono text-primary font-bold">{createdOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-foreground pt-1 border-t border-border">
                <span>Total Amount Paid:</span>
                <span>${createdOrder.totalAmount?.toFixed(2) || totalPrice}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                <ShieldCheck className="h-4 w-4" />
                <span>Order recorded in official treasury ledger</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button className="rounded-full w-full" onClick={() => navigate('/orders')}>
                View My Orders
              </Button>
              <Button variant="ghost" className="rounded-full w-full" onClick={onClose}>
                Continue Shopping
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">{product.category}</span>
              <h2 className="text-2xl font-extrabold mt-1">{product.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
            </div>

            {/* Variant selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Select Size & Color Variant
              </label>
              <div className="grid gap-2">
                {product.variants?.map((v) => (
                  <button
                    key={v.sku}
                    type="button"
                    disabled={v.stock === 0}
                    onClick={() => {
                      setSelectedVariant(v);
                      setQuantity(1);
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-sm font-medium transition-all ${
                      selectedVariant?.sku === v.sku
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                        : v.stock === 0
                        ? 'border-border bg-muted/40 text-muted-foreground opacity-50 cursor-not-allowed'
                        : 'border-border hover:border-foreground'
                    }`}
                  >
                    <span>{v.size ? `Size ${v.size}` : ''} {v.color ? `(${v.color})` : ''}</span>
                    <span className="text-xs">
                      {v.stock > 0 ? (
                        <span className="text-emerald-500 font-semibold">{v.stock} in stock</span>
                      ) : (
                        <span className="text-destructive font-semibold">Out of Stock</span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            {selectedVariant && availableStock > 0 && (
              <div className="flex items-center justify-between bg-muted/50 p-4 rounded-2xl">
                <span className="text-sm font-semibold">Quantity</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="h-8 w-8 rounded-full border border-border bg-background flex items-center justify-center disabled:opacity-40"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="font-mono font-extrabold text-lg w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                    disabled={quantity >= availableStock}
                    className="h-8 w-8 rounded-full border border-border bg-background flex items-center justify-center disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Price & Summary */}
            <div className="flex items-center justify-between border-t border-border pt-4">
              <div>
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider block">Total Amount</span>
                <span className="text-3xl font-extrabold text-foreground">${totalPrice}</span>
              </div>

              <Button
                onClick={() => {
                  if (!token || !isMember) {
                    navigate(!token ? '/login' : '/membership/join');
                    return;
                  }
                  handleOrder();
                }}
                disabled={loading || availableStock === 0}
                className="rounded-full px-6 h-12 text-base font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Ordering...
                  </>
                ) : !token ? (
                  'Sign In to Checkout'
                ) : !isMember ? (
                  'Join / Renew to Order'
                ) : (
                  <>
                    Checkout Order
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
