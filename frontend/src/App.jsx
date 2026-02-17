import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { API_BASE_URL } from './config'
import Homepage from './components/homepage/Homepage'
import Login from './components/login/Login'
import Category from './components/category/Category'
import Items from './components/items/Items'
import Cart from './components/cart/Cart'

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
      const response = await fetch(`${API_BASE_URL}/api/items/cart/${userId}`);
      const data = await response.json();
      if (data.items) {
        setCart(data.items);
      }
    } catch (error) {
      console.error("Error fetching cart from DB:", error);
    }
  };

  const syncCartWithDB = async (newCart) => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return;
    const userId = JSON.parse(savedUser).id;

    try {
      await fetch(`${API_BASE_URL}/api/items/cart/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, cart: newCart })
      });
    } catch (error) {
      console.error("Error syncing cart with DB:", error);
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

  const clearCart = () => {
    setCart([]);
    syncCartWithDB([]);
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/auth/test-db`)
      .then(res => res.json())
      .then(data => {
        setDbStatus(data.message)
      })
      .catch(err => {
        setDbStatus('Connection failed ❌')
        console.error('API Error:', err)
      })
  }, [])

  return (
    <Router>
      <div className="app-main">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/"
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
                <Items cart={cart} addToCart={addToCart} clearCart={clearCart} />
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

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
