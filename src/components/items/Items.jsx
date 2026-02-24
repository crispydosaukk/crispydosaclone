import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, ShoppingCart, Plus, Minus, CheckCircle } from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import './Items.css';

const Items = ({ cart, addToCart, updateQuantity, clearCart }) => {
    const { categoryId } = useParams();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryName, setCategoryName] = useState('');
    const [cartOpen, setCartOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchItems();
        fetchCategoryDetails();
    }, [categoryId]);

    const fetchItems = async () => {
        try {
            // Updated collection name to match screenshot inventoryItems
            const itemsRef = collection(db, "inventoryItems");
            const q = query(itemsRef, where("categoryId", "==", categoryId));
            const snapshot = await getDocs(q);

            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setItems(data);
        } catch (error) {
            console.error("Error fetching items:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategoryDetails = async () => {
        try {
            // Using inventoryCategory as per screenshot
            const catRef = doc(db, "inventoryCategory", categoryId);
            const catSnap = await getDoc(catRef);

            if (catSnap.exists()) {
                setCategoryName(catSnap.data().category);
            }
        } catch (error) {
            console.error("Error fetching category details:", error);
        }
    };

    const getItemQuantity = (itemId) => {
        const cartItem = cart.find(i => i.id === itemId);
        return cartItem ? cartItem.quantity : 0;
    };

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className="items-page">
            <main className="items-container">
                <div className="page-title-section">
                    <h1>{categoryName || 'Menu'} <span className="highlight">Items</span></h1>
                </div>

                {/* Content */}

                {loading ? (
                    <div className="loader-container">
                        <Loader2 className="animate-spin" size={48} />
                        <p>Loading items...</p>
                    </div>
                ) : (
                    <div className="items-grid">
                        {items.length > 0 ? items.map((item, index) => {
                            const quantity = getItemQuantity(item.id);
                            return (
                                <div
                                    key={item.id || index}
                                    className="item-card"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="item-info">
                                        <h3>{item.title || item.brand || 'Item'}</h3>
                                        <p className="item-type">{item.itemType}</p>
                                        <div className="item-details">
                                            <span className="stock">Available: {item.availableQuantity}</span>
                                        </div>
                                    </div>
                                    <div className="item-actions">
                                        {quantity > 0 ? (
                                            <div className="quantity-selector">
                                                <button
                                                    className="qty-btn minus"
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                >
                                                    <Minus size={20} stroke="white" />
                                                </button>
                                                <span className="qty-value">{quantity}</span>
                                                <button
                                                    className="qty-btn plus"
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    disabled={quantity >= item.availableQuantity}
                                                >
                                                    <Plus size={20} stroke="white" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                className="add-to-cart-btn"
                                                onClick={() => addToCart(item)}
                                                disabled={item.availableQuantity <= 0}
                                            >
                                                {item.availableQuantity > 0 ? (
                                                    <>
                                                        <Plus size={20} stroke="white" /> Add to Cart
                                                    </>
                                                ) : 'Out of Stock'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="no-items">
                                <h3>No items found in this category.</h3>
                                <button onClick={() => navigate('/category')}>Go Back</button>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Sticky Footer for Cart Summary & Redirection */}
            {cart.length > 0 && (
                <div className={`cart-dropup ${cartOpen ? 'cart-dropup--open' : ''}`}>
                    {/* Expandable item list */}
                    <div className="cart-dropup-panel">
                        <div className="cart-dropup-items">
                            {cart.map((item) => (
                                <div className="cart-footer-item-row" key={item.id}>
                                    <span className="cart-footer-item-name">{item.title || item.brand}</span>
                                    <div className="cart-footer-qty-block">
                                        <span className="cart-footer-qty-label">Qty</span>
                                        <span className="cart-footer-qty-number">{item.quantity}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            className="place-order-btn"
                            onClick={() => navigate('/addtocart')}
                        >
                            🛒 Place Order
                        </button>
                    </div>

                    {/* Always-visible compact bar */}
                    <div className="cart-dropup-bar" onClick={() => setCartOpen(o => !o)}>
                        <div className="cart-dropup-bar-left">
                            <span className="cart-dropup-icon">🛒</span>
                            <span className="cart-dropup-count">{cartCount} item{cartCount !== 1 ? 's' : ''} in cart</span>
                        </div>
                        <span className={`cart-dropup-chevron ${cartOpen ? 'cart-dropup-chevron--up' : ''}`}>▲</span>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Items;
