import { createContext, useEffect, useState } from 'react';
import api, { setAuthToken } from '../api/client';

export const StoreContext = createContext(null);

const tokenKey = 'quikbite.token';
const userKey = 'quikbite.user';
const lastOrderKey = 'quikbite:lastOrder';

const deliveryFee = 2.99;

export const StoreContextProvider = ({ children }) => {
  const [foods, setFoods] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const applySession = (token, nextUser) => {
    if (token) {
      localStorage.setItem(tokenKey, token);
      setAuthToken(token);
    } else {
      localStorage.removeItem(tokenKey);
      setAuthToken(null);
    }

    if (nextUser) {
      localStorage.setItem(userKey, JSON.stringify(nextUser));
      setUser(nextUser);
      setCartItems(nextUser.cartData || {});
      return;
    }

    localStorage.removeItem(userKey);
    setUser(null);
    setCartItems({});
  };

  const loadFoods = async () => {
    const response = await api.get('/api/food/list');
    setFoods(response.data.foods || []);
  };

  const loadProfile = async () => {
    const token = localStorage.getItem(tokenKey);
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setAuthToken(token);
      const response = await api.get('/api/user/me');
      applySession(token, response.data.user);
    } catch (requestError) {
      applySession(null, null);
      setError(requestError.response?.data?.message || 'Session expired. Please log in again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await Promise.all([loadFoods(), loadProfile()]);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Failed to load application data');
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/api/user/login', { email, password });
    applySession(response.data.token, response.data.user);
    return response.data.user;
  };

  const register = async (name, email, password) => {
    const response = await api.post('/api/user/register', { name, email, password });
    applySession(response.data.token, response.data.user);
    return response.data.user;
  };

  const logout = () => {
    applySession(null, null);
    setOrders([]);
  };

  const refreshCart = (nextCartData) => {
    setCartItems(nextCartData || {});
    if (user) {
      const nextUser = { ...user, cartData: nextCartData || {} };
      localStorage.setItem(userKey, JSON.stringify(nextUser));
      setUser(nextUser);
    }
  };

  const addToCart = async (foodId, quantity = 1) => {
    const response = await api.post('/api/cart/add', { foodId, quantity });
    refreshCart(response.data.cartData);
    return response.data.cartData;
  };

  const removeFromCart = async (foodId, quantity = 1) => {
    const response = await api.post('/api/cart/remove', { foodId, quantity });
    refreshCart(response.data.cartData);
    return response.data.cartData;
  };

  const updateCart = async (foodId, quantity) => {
    const response = await api.post('/api/cart/update', { foodId, quantity });
    refreshCart(response.data.cartData);
    return response.data.cartData;
  };

  const getCartItems = () => {
    return Object.entries(cartItems)
      .map(([foodId, quantity]) => {
        const food = foods.find((item) => item._id === foodId);
        if (!food) {
          return null;
        }
        return {
          ...food,
          quantity,
          lineTotal: Number((food.price * quantity).toFixed(2))
        };
      })
      .filter(Boolean);
  };

  const getCartTotals = () => {
    const subtotal = getCartItems().reduce((sum, item) => sum + item.lineTotal, 0);
    const fee = subtotal > 0 ? deliveryFee : 0;
    return {
      subtotal: Number(subtotal.toFixed(2)),
      deliveryFee: fee,
      grandTotal: Number((subtotal + fee).toFixed(2))
    };
  };

  const loadOrders = async () => {
    const response = await api.get('/api/order/userorders');
    setOrders(response.data.orders || []);
    return response.data.orders || [];
  };

  const placeOrder = async (address, payment = { method: 'Cash on Delivery', paid: false }) => {
    const items = getCartItems().map((item) => ({ foodId: item._id, quantity: item.quantity }));
    const response = await api.post('/api/order/place', { address, payment, items });
    localStorage.setItem(lastOrderKey, JSON.stringify(response.data.order));
    try {
      await loadOrders();
    } catch (loadError) {
      console.error(loadError);
    }
    refreshCart({});
    return response.data.order;
  };

  const getLastOrder = () => {
    const stored = localStorage.getItem(lastOrderKey);
    return stored ? JSON.parse(stored) : null;
  };

  const value = {
    foods,
    user,
    loading,
    error,
    cartItems,
    orders,
    login,
    register,
    logout,
    addToCart,
    removeFromCart,
    updateCart,
    getCartItems,
    getCartTotals,
    loadOrders,
    placeOrder,
    getLastOrder,
    refreshCart,
    setError,
    clearError: () => setError('')
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};
