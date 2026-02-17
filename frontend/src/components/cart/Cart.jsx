import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, ShoppingBag } from 'lucide-react';
import './Cart.css';

const Cart = ({ cart, removeFromCart, clearCart }) => {
    const navigate = useNavigate();
    const cartTotal = cart.reduce((acc, item) => acc + (item.actualPrice * item.quantity), 0);

    return (
        <div className="cart-page">
            <header className="cart-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <h1>My <span className="highlight">Cart</span></h1>
            </header>

            <main className="cart-container">
                {cart.length > 0 ? (
                    <div className="cart-items-list">
                        {cart.map((item) => (
                            <div key={item.id} className="cart-item-card">
                                <div className="item-details">
                                    <h3>{item.brand}</h3>
                                    <p>Quantity: {item.quantity}</p>
                                    <p className="item-price">₹{item.actualPrice * item.quantity}</p>
                                </div>
                                <button
                                    className="remove-btn"
                                    onClick={() => removeFromCart(item.id)}
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}

                        <div className="cart-total-section">
                            <div className="total-row">
                                <span>Subtotal</span>
                                <span>₹{cartTotal}</span>
                            </div>
                            <div className="total-row grand-total">
                                <span>Grand Total</span>
                                <span>₹{cartTotal}</span>
                            </div>
                            <button className="checkout-btn" onClick={() => navigate(-1)}>
                                Proceed to Items
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="empty-cart">
                        <ShoppingBag size={64} color="#ccc" />
                        <h3>Your cart is empty</h3>
                        <p>Add some delicious items to get started!</p>
                        <button className="explore-btn" onClick={() => navigate('/category')}>
                            Explore Menu
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Cart;
