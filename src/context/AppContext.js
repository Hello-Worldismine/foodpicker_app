import React, { createContext, useContext, useState } from 'react';
import { products as initialProducts, mockOrders, mockCoupons } from '../data/mockData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [productList, setProductList] = useState(initialProducts);
  const [orders, setOrders] = useState(mockOrders);
  const coupons = mockCoupons;

  function handleLike(productId) {
    setProductList(prev =>
      prev.map(p => p.id === productId ? { ...p, liked: !p.liked } : p)
    );
  }

  function handleOrderComplete(order) {
    setOrders(prev => [order, ...prev]);
  }

  function handleCancelOrder(orderId) {
    setOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o)
    );
  }

  return (
    <AppContext.Provider value={{
      productList,
      orders,
      coupons,
      handleLike,
      handleOrderComplete,
      handleCancelOrder,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
