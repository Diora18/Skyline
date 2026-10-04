import { useState, useEffect } from 'react';
import productService from '@/services/productService';
import { Package, Save, Plus, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingSku, setUpdatingSku] = useState(null);
  const [stockInputs, setStockInputs] = useState({});

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productService.getProducts();
      setProducts(res.data.products || []);
      const inputs = {};
      res.data.products?.forEach((p) => {
        p.variants?.forEach((v, index) => {
          inputs[`${p._id}:${index}`] = v.stock;
        });
      });
      setStockInputs(inputs);
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSaveStock = async (productId, variantIndex, variantKey) => {
    setUpdatingSku(variantKey);
    try {
      const newStock = Number(stockInputs[variantKey]);
      await productService.updateStock(productId, variantIndex, newStock);
      await fetchProducts();
    } catch (err) {
      alert(err.message || 'Failed to update stock');
    } finally {
      setUpdatingSku(null);
    }
  };

  return (
    <main className="min-h-screen py-12 px-4 md:px-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Executive Operations</span>
          <h1 className="text-3xl md:text-4xl font-extrabold mt-1">Merch Inventory & Stock</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time stock level management across all apparel and merchandise SKU variants.
          </p>
        </div>

        <Button onClick={fetchProducts} variant="outline" className="rounded-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Stock Data
        </Button>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm font-medium">Loading inventory stock levels...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-dashed border-border p-8 mt-8">
          <Package className="mx-auto h-12 w-12 text-muted-foreground/60 mb-3" />
          <h3 className="text-xl font-bold">No products in store catalog</h3>
        </div>
      ) : (
        <div className="space-y-8 mt-8">
          {products.map((product) => (
            <div key={product._id} className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">{product.category}</span>
                  <h3 className="text-2xl font-extrabold">{product.name}</h3>
                </div>
                <span className="text-xl font-extrabold">${product.basePrice}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider font-bold text-muted-foreground">
                    <tr>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Size</th>
                      <th className="p-3">Color</th>
                      <th className="p-3">Current Stock</th>
                      <th className="p-3 text-right">Update Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {product.variants?.map((v, variantIndex) => {
                      const variantKey = `${product._id}:${variantIndex}`;
                      const isUpdating = updatingSku === variantKey;

                      return (
                        <tr key={variantKey} className="hover:bg-muted/30">
                          <td className="p-3 font-mono text-xs font-bold">{product.name}-{v.size}-{v.color}</td>
                          <td className="p-3 font-semibold">{v.size || 'N/A'}</td>
                          <td className="p-3">{v.color || 'N/A'}</td>
                          <td className="p-3">
                            <input
                              type="number"
                              min="0"
                              value={stockInputs[variantKey] ?? v.stock}
                              onChange={(e) => setStockInputs({ ...stockInputs, [variantKey]: e.target.value })}
                              className="w-24 rounded-xl border border-input bg-background px-3 py-1.5 font-mono text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </td>
                          <td className="p-3 text-right">
                            <Button
                              size="sm"
                              disabled={isUpdating}
                              onClick={() => handleSaveStock(product._id, variantIndex, variantKey)}
                              className="rounded-full text-xs"
                            >
                              {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />}
                              Save Stock
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
