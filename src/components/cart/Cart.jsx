import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, ShoppingBag, CheckCircle, Loader2 } from 'lucide-react';

import './Cart.css';

const Cart = ({ cart, removeFromCart, clearCart }) => {
    const navigate = useNavigate();
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [showOrderPopup, setShowOrderPopup] = useState(false);

    // contact/billing info states
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [contactAddress, setContactAddress] = useState('');

    React.useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const u = JSON.parse(savedUser);
            setContactEmail(u.email || '');
            setContactPhone(u.phone || '');
            setContactAddress(u.address || '');
        }
    }, []);

    const handlePlaceOrder = async () => {
        if (cart.length === 0) return;

        setIsPlacingOrder(true);
        try {
            const { collection, doc, addDoc, setDoc, updateDoc, getDoc, writeBatch } = await import('firebase/firestore');
            const { db } = await import('../../firebase');

            const savedUser = localStorage.getItem('user');
            const user = savedUser ? JSON.parse(savedUser) : null;
            const userId = user ? user.id : "guest";
            const userName = user ? user.name : "Anonymous";
            const restaurantName = user ? user.restaurantName : "Saravana Bhavan";

            // transform cart items to include price details at time of order
            const itemsForOrder = cart.map(item => {
                const unitPrice = item.actualPrice || item.price || 0;
                const hasVAT = item.hasVAT !== undefined ? item.hasVAT : true; // default true for legacy
                const vatAmt = hasVAT ? parseFloat((unitPrice * 0.20).toFixed(2)) : 0;
                const priceIncl = hasVAT ? parseFloat((unitPrice + vatAmt).toFixed(2)) : unitPrice;
                return {
                    ...item,
                    unitPrice,
                    hasVAT,
                    // legacy field names used by admin panel and other services
                    price: unitPrice,
                    priceExclVAT: unitPrice,
                    vatAmount: vatAmt,
                    priceInclVAT: priceIncl,
                    totalPrice: parseFloat((unitPrice * item.quantity).toFixed(2)),
                    units: item.units || 'KG' // ensure units field exists
                };
            });

            const subtotalValue = itemsForOrder.reduce((acc, item) => acc + item.totalPrice, 0);
            const taxValue = parseFloat((subtotalValue * 0.20).toFixed(2));
            const totalValue = parseFloat((subtotalValue + taxValue).toFixed(2));

            const orderData = {
                userId,
                name: userName,
                restaurantName,
                items: itemsForOrder,
                subtotal: parseFloat(subtotalValue.toFixed(2)) || 0,
                tax: taxValue || 0,
                totalPrice: totalValue || 0,
                email: contactEmail,
                phone: contactPhone,
                address: contactAddress,
                orderStatus: "pending",
                isBillPaid: false,
                source: "mobile",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const batch = writeBatch(db);

            // validation: email must be provided
            if (!contactEmail) {
                alert('Please enter your email before placing the order.');
                setIsPlacingOrder(false);
                return;
            }

            // 1. Save to invoices
            const invoiceRef = doc(collection(db, "invoices"));
            batch.set(invoiceRef, orderData);

            // 2. Save to orders
            const orderRef = doc(collection(db, "orders"));
            batch.set(orderRef, orderData);

            // 3. Clear user cart
            if (userId !== "guest") {
                const cartRef = doc(db, "userCart", userId);
                batch.set(cartRef, { items: [], updatedAt: new Date().toISOString() }, { merge: true });
            }

            // 4. Update inventory
            for (const item of cart) {
                if (item.id) {
                    const itemRef = doc(db, "inventoryItems", item.id);
                    const itemSnap = await getDoc(itemRef);
                    if (itemSnap.exists()) {
                        const currentQty = itemSnap.data().availableQuantity || 0;
                        const newQty = Math.max(0, currentQty - item.quantity);
                        batch.update(itemRef, {
                            availableQuantity: newQty,
                            updatedAt: new Date().toISOString()
                        });
                    }
                }
            }

            await batch.commit();
            setShowOrderPopup(true);
            clearCart();
        } catch (error) {
            console.error("Error placing order:", error);
            alert("Failed to place order. Please try again.");
        } finally {
            setIsPlacingOrder(false);
        }
    };

    return (
        <div className="cart-page">
            <main className="cart-container">
                <div className="page-title-section">
                    <h1>My <span className="highlight">Cart</span></h1>
                </div>

                {cart.length > 0 ? (
                    <div className="cart-items-list">
                        {cart.map((item) => (
                            <div key={item.id} className="cart-item-card">
                                <h3 className="cart-item-name">{item.title || item.brand}</h3>
                                <div className="cart-item-right">
                                    <div className="cart-qty-block">
                                        <span className="cart-qty-label">QTY</span>
                                        <span className="cart-qty-number">{item.quantity}</span>
                                    </div>
                                    <button
                                        className="remove-btn"
                                        onClick={() => removeFromCart(item.id)}
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* contact info inputs */}
                        {/* <div className="contact-info-section">
                            <h3>Contact / Billing Info</h3>
                            <div className="input-group">
                                <label>Email *</label>
                                <div className="input-wrapper">
                                    <input
                                        type="email"
                                        value={contactEmail}
                                        onChange={e => setContactEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Phone</label>
                                <div className="input-wrapper">
                                    <input
                                        type="tel"
                                        value={contactPhone}
                                        onChange={e => setContactPhone(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Address</label>
                                <div className="input-wrapper">
                                    <textarea
                                        value={contactAddress}
                                        onChange={e => setContactAddress(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div> */}

                        <div className="cart-actions-section">
                            <button
                                className="checkout-btn"
                                onClick={handlePlaceOrder}
                                disabled={isPlacingOrder}
                            >
                                {isPlacingOrder ? <Loader2 className="animate-spin" size={20} /> : 'Place Order'}
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

            {/* Animated Succession Popup */}
            {showOrderPopup && (
                <div className="order-success-overlay">
                    <div className="success-popup animated-bounceIn">
                        <div className="success-icon">
                            <CheckCircle size={64} color="#4CAF50" />
                        </div>
                        <h2>Order Placed!</h2>
                        <p>Your delicious meal is being prepared.</p>
                        <div className="popup-actions">
                            <button className="primary-popup-btn" onClick={() => navigate('/orders')}>
                                View My Orders
                            </button>
                            <button className="close-popup-btn" onClick={() => {
                                setShowOrderPopup(false);
                                navigate('/homepage');
                            }}>
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
