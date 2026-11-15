import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { initialOrders, initialProducts } from "../data/catalog";
import { request } from "../services/api";

const CommerceContext = createContext(null);
export function CommerceProvider({ children }) {
  const [products, setProducts] = useState(initialProducts); const [cart, setCart] = useState([]); const [favorites, setFavorites] = useState(["p2"]); const [orders, setOrders] = useState(initialOrders); const [remoteReady, setRemoteReady] = useState(false);
  const withLocalImage = product => ({ ...product, image: initialProducts.find(item => item.name === product.name)?.image || product.imageUrl || product.image_url || null });
  const refreshCatalog = async () => { const result = await request("/products"); setProducts(result.data.map(withLocalImage)); setRemoteReady(true); };
  const refreshOrders = async () => { const result = await request("/orders"); setOrders(result.data.map(order => ({ id: order.orderNumber, date: new Date(order.createdAt).toLocaleDateString(), status: order.status, total: order.total, items: order.items }))); };
  useEffect(() => { refreshCatalog().catch(() => setRemoteReady(false)); }, []);
  const addToCart = (product, size = "One size", quantity = 1) => setCart(current => { const key = `${product.id}-${size}`; const found = current.find(x => x.key === key); return found ? current.map(x => x.key === key ? { ...x, quantity: x.quantity + quantity } : x) : [...current, { ...product, key, size, quantity }]; });
  const changeQuantity = (key, step) => setCart(current => current.map(x => x.key === key ? { ...x, quantity: Math.max(1, x.quantity + step) } : x));
  const removeFromCart = key => setCart(current => current.filter(x => x.key !== key));
  const toggleFavorite = id => setFavorites(current => current.includes(id) ? current.filter(x => x !== id) : [...current, id]);
  const saveProduct = async product => { if (!remoteReady) throw new Error("Product service is unavailable"); const payload = { ...product, imageUrl: typeof product.image === "string" ? product.image : product.imageUrl || null, stock: Number(product.stock || 0), price: Number(product.price || 0) }; const result = await request(product.id ? `/products/${product.id}` : "/products", { method: product.id ? "PATCH" : "POST", body: JSON.stringify(payload) }); setProducts(current => product.id ? current.map(x => x.id === product.id ? withLocalImage(result.data) : x) : [withLocalImage(result.data), ...current]); return result.data; };
  const removeProduct = async id => { if (!remoteReady) throw new Error("Product service is unavailable"); await request(`/products/${id}`, { method: "DELETE" }); setProducts(current => current.filter(x => x.id !== id)); };
  const checkout = async () => { if (!remoteReady) throw new Error("Checkout service is unavailable"); const result = await request("/orders", { method: "POST", body: JSON.stringify({ items: cart.map(item => ({ productId: item.id, quantity: item.quantity, size: item.size })) }) }); const order = { id: result.data.orderNumber, date: "Today", status: result.data.status, total: result.data.total, items: result.data.items }; setOrders(o => [order, ...o]); setCart([]); refreshCatalog().catch(() => {}); return order; };
  const value = useMemo(() => ({ products, cart, favorites, orders, addToCart, changeQuantity, removeFromCart, toggleFavorite, saveProduct, removeProduct, checkout, refreshCatalog, refreshOrders, remoteReady, cartCount: cart.reduce((n,x) => n+x.quantity,0), cartTotal: cart.reduce((n,x) => n+x.quantity*x.price,0) }), [products,cart,favorites,orders,remoteReady]);
  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
}
export const useCommerce = () => useContext(CommerceContext);
