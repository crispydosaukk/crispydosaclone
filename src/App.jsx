import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import Homepage from './components/homepage/Homepage'
import Login from './components/login/Login'
import Category from './components/category/Category'
import Items from './components/items/Items'
import Cart from './components/cart/Cart'
import Orders from './components/orders/Orders'
import Waste from './components/waste/Waste'
// dashboard component removed; not required for simple storage

import Header from './components/header/Header'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (Prevent logged in users from seeing Login)
const PublicRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? <Navigate to="/homepage" replace /> : children;
};

function App() {
  const [dbStatus, setDbStatus] = useState('Connecting...')
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      fetchCart(parsedUser.id);
    }
  }, []);

  const fetchCart = async (userId) => {
    try {
      console.log(`Firestore: Fetching cart for user: ${userId}`);
      const cartRef = doc(db, 'userCart', userId);
      const cartSnap = await getDoc(cartRef);

      if (cartSnap.exists()) {
        const items = cartSnap.data().items || [];
        console.log(`Firestore: Found ${items.length} items in saved cart.`);
        setCart(items);
      }
    } catch (error) {
      console.error("Firestore Error in App.jsx (fetchCart):", error);
    }
  };

  const syncCartWithDB = async (newCart) => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return;
    const userId = JSON.parse(savedUser).id;

    try {
      const cartRef = doc(db, 'userCart', userId);
      await setDoc(cartRef, {
        items: newCart,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error("Firestore Error in App.jsx (syncCartWithDB):", error);
    }
  };

  const addToCart = (product) => {
    setCart(prevCart => {
      let newCart;
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        newCart = prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        newCart = [...prevCart, { ...product, quantity: 1 }];
      }
      syncCartWithDB(newCart);
      return newCart;
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => {
      const newCart = prevCart.filter(item => item.id !== productId);
      syncCartWithDB(newCart);
      return newCart;
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === productId);
      if (!existingItem) return prevCart;

      const newQuantity = Math.max(0, existingItem.quantity + delta);
      let newCart;
      if (newQuantity === 0) {
        newCart = prevCart.filter(item => item.id !== productId);
      } else {
        newCart = prevCart.map(item =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        );
      }
      syncCartWithDB(newCart);
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    syncCartWithDB([]);
  };

  useEffect(() => {
    setDbStatus('Firebase Connected ✅');
  }, [])

  return (
    <Router>
      <div className="app-main">
        <Header cart={cart} />
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                {/* allow login component to update App state and load cart immediately */}
                <Login setUser={setUser} fetchCart={fetchCart} />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          {/* always send bare root to login; the protected route will handle
               redirects once the user is authenticated */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          {/* authenticated homepage lives on its own path */}
          <Route
            path="/homepage"
            element={
              <ProtectedRoute>
                <Homepage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/homepage"
            element={
              <ProtectedRoute>
                <Homepage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/category"
            element={
              <ProtectedRoute>
                <Category />
              </ProtectedRoute>
            }
          />
          <Route
            path="/items/:categoryId"
            element={
              <ProtectedRoute>
                <Items cart={cart} addToCart={addToCart} updateQuantity={updateQuantity} clearCart={clearCart} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addtocart"
            element={
              <ProtectedRoute>
                <Cart cart={cart} removeFromCart={removeFromCart} clearCart={clearCart} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/waste"
            element={
              <ProtectedRoute>
                <Waste />
              </ProtectedRoute>
            }
          />
          {/* admin dashboard for waste; userRole is enforced within the component itself */}

          {/* Fallback for any unknown URL – send user to login so they can start again. */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
