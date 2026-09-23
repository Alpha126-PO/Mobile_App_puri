import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  function addToCart(item) {
    setCart((prev) => [...prev, item]);
  }

  function removeFromCart(index) {
    setCart((prev) => prev.filter((_, i) => i !== index));

  }
  
  function updateQuantity(index, delta){
    setCart((prev) => 
      prev.map((item, i) => 
        i === index ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )  
    );
  }

  function clearCart() {
    setCart([]);
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart ต้องถูกเรียกใต้ <CartProvider> เท่านั้น');
  }
  return ctx;
}
