import api from './api';

export const productService = {
  getProducts: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/products?${query}` : '/products';
    return await api.get(endpoint);
  },

  getProductById: async (id) => {
    return await api.get(`/products/${id}`);
  },

  createProduct: async (productData) => {
    return await api.post('/products', productData);
  },

  updateProduct: async (id, productData) => {
    return await api.patch(`/products/${id}`, productData);
  },

  updateStock: async (id, variantIndex, stock) => {
    return await api.patch(`/products/${id}/stock`, { variantIndex, stock });
  },
};

export default productService;
