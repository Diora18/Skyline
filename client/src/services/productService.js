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
    return await api.put(`/products/${id}`, productData);
  },

  updateStock: async (id, variantSku, stock) => {
    return await api.put(`/products/${id}/stock`, { variantSku, stock });
  },
};

export default productService;
