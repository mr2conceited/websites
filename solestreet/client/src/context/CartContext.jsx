import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [] });
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get('/cart');
      setCart(data.cart);
    } catch {
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = async (productId, variantId, quantity = 1) => {
    const { data } = await api.post('/cart/items', { productId, variantId, quantity });
    setCart(data.cart);
  };

  const updateItem = async (variantId, quantity) => {
    const { data } = await api.put(`/cart/items/${variantId}`, { quantity });
    setCart(data.cart);
  };

  const removeItem = async (variantId) => {
    const { data } = await api.delete(`/cart/items/${variantId}`);
    setCart(data.cart);
  };

  const clearCart = async () => {
    const { data } = await api.delete('/cart');
    setCart(data.cart);
  };

  const itemCount = cart.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
  const subtotal = cart.items?.reduce((sum, i) => sum + i.price * i.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{ cart, loading, addItem, updateItem, removeItem, clearCart, refreshCart, itemCount, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
};
