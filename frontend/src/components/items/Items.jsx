import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, ShoppingCart, Plus, Minus, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import './Items.css';

const Items = ({ cart, addToCart, clearCart }) => {
    const { categoryId } = useParams();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryName, setCategoryName] = useState('');
    const [showOrderPopup, setShowOrderPopup] = useState(false);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchItems();
        fetchCategoryDetails();
    }, [categoryId]);

    const fetchItems = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/items/category/${categoryId}`);
            const data = await response.json();
            setItems(data);
        } catch (error) {
            console.error("Error fetching items:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategoryDetails = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/categories`);
            const data = await response.json();
            const currentCat = data.find(c => c.id === categoryId);
            if (currentCat) {
                setCategoryName(currentCat.category);
            }
        } catch (error) {
            console.error("Error fetching category details:", error);
        }
    };

    const handlePlaceOrder = async () => {
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        setIsPlacingOrder(true);
        try {
            const savedUser = localStorage.getItem('user');
            const userId = savedUser ? JSON.parse(savedUser).id : null;

            const response = await fetch(`${API_BASE_URL}/api/items/place-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    items: cart,
                    total: cart.reduce((acc, item) => acc + (item.actualPrice * item.quantity), 0),
                    timestamp: new Date().toISOString()
                })
            });
            const data = await response.json();
            if (data.success) {
                setShowOrderPopup(true);
                clearCart();
            }
        } catch (error) {
            console.error("Error placing order:", error);
            alert("Failed to place order. Please try again.");
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = cart.reduce((acc, item) => acc + (item.actualPrice * item.quantity), 0);

    return (
        <div className="items-page">
            {/* Header */}
            <header className="items-header">
                <div className="header-content">
                    <button className="back-btn" onClick={() => navigate('/category')}>
                        <ArrowLeft size={24} />
                    </button>
                    <h1>{categoryName || 'Menu'} <span className="highlight">Items</span></h1>
                    <div className="cart-status" onClick={() => navigate('/addtocart')} style={{ cursor: 'pointer' }}>
                        <ShoppingCart size={24} />
                        <span className="cart-count">{cartCount}</span>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="items-container">
                {loading ? (
                    <div className="loader-container">
                        <Loader2 className="animate-spin" size={48} />
                        <p>Loading items...</p>
                    </div>
                ) : (
                    <div className="items-grid">
                        {items.length > 0 ? items.map((item, index) => (
                            <div
                                key={item.id || index}
                                className="item-card"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="item-info">
                                    <h3>{item.brand}</h3>
                                    <p className="item-type">{item.itemType}</p>
                                    <div className="item-details">
                                        <span className="price">₹{item.actualPrice}</span>
                                        <span className="stock">Available: {item.availableQuantity}</span>
                                    </div>
                                </div>
                                <div className="item-actions">
                                    <button
                                        className="add-to-cart-btn"
                                        onClick={() => addToCart(item)}
                                        disabled={item.availableQuantity <= 0}
                                    >
                                        {item.availableQuantity > 0 ? (
                                            <>
                                                <Plus size={18} /> Add to Cart
                                            </>
                                        ) : 'Out of Stock'}
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="no-items">
                                <h3>No items found in this category.</h3>
                                <button onClick={() => navigate('/category')}>Go Back</button>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Sticky Footer for Cart Summary & Place Order */}
            {cart.length > 0 && (
                <div className="cart-footer-sticky">
                    <div className="cart-summary">
                        <span>{cartCount} Items</span>
                        <span className="total-amount">Total: ₹{cartTotal}</span>
                    </div>
                    <button
                        className="place-order-btn"
                        onClick={handlePlaceOrder}
                        disabled={isPlacingOrder}
                    >
                        {isPlacingOrder ? <Loader2 className="animate-spin" size={20} /> : 'Place Order'}
                    </button>
                </div>
            )}

            {/* Animated Succession Popup */}
            {showOrderPopup && (
                <div className="order-success-overlay">
                    <div className="success-popup animated-bounceIn">
                        <div className="success-icon">
                            <CheckCircle size={64} color="#4CAF50" />
                        </div>
                        <h2>Order Placed!</h2>
                        <p>Your delicious meal is being prepared.</p>
                        <button className="close-popup-btn" onClick={() => {
                            setShowOrderPopup(false);
                            navigate('/homepage');
                        }}>
                            Back to Home
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Items;
