import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Package, Calendar, Clock, ChevronRight } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import './Orders.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (!savedUser) {
            navigate('/login');
            return;
        }
        const userId = JSON.parse(savedUser).id;

        console.log(`Firestore: Listening for orders for userId: ${userId}`);

        // Removed orderBy to avoid index requirement; sorting in-memory below
        // we read from the 'orders' collection which mirrors invoices
        const ordersRef = collection(db, "orders");
        const q = query(
            ordersRef,
            where("userId", "==", userId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort by createdAt descending in memory
            data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            console.log(`Firestore: Received ${data.length} orders (Real-time).`);
            setOrders(data);
            setLoading(false);
        }, (error) => {
            console.error("Firestore Listen Error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [navigate]);

    // fetchOrders can be removed as we use onSnapshot now
    const fetchOrders = () => { };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (num) => {
        if (num == null) return '£0.00';
        return '£' + parseFloat(num).toFixed(2);
    };

    return (
        <div className="orders-page">
            <main className="orders-container">
                <div className="page-title-section">
                    <h1>My <span className="highlight">Orders</span></h1>
                </div>

                {loading ? (
                    <div className="loader-container">
                        <Loader2 className="animate-spin" size={48} />
                        <p>Loading your orders...</p>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.length > 0 ? orders.map((order, index) => (
                            <div
                                key={order.id}
                                className="order-card"
                                style={{ animationDelay: `${index * 0.1}s` }}
                                onClick={() => setSelectedOrder(order)}
                            >
                                <div className="order-card-header">
                                    <div className="order-info">
                                        <div className="order-id">ID: #{order.id.slice(-6).toUpperCase()}</div>
                                        <div className="order-status-badge" data-status={order.orderStatus}>
                                            {order.orderStatus}
                                        </div>
                                    </div>
                                    <div className="order-date-time">
                                        <span><Calendar size={14} /> {formatDate(order.createdAt)}</span>
                                        <span><Clock size={14} /> {formatTime(order.createdAt)}</span>
                                    </div>
                                </div>
                                <div className="order-items-preview">
                                    <div className="order-items-list">
                                        {order.items.map((item, i) => (
                                            <div key={i} className="order-item-row">
                                                <span className="order-item-name">{item.title || item.brand}</span>
                                                <div className="order-item-qty-block">
                                                    <span className="order-item-qty-label">QTY</span>
                                                    <span className="order-item-qty-number">{item.quantity}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                              
                            </div>
                        )) : (
                            <div className="no-orders">
                                <Package size={64} color="#ccc" />
                                <h3>No orders found</h3>
                                <p>Looks like you haven't placed any orders yet.</p>
                                <button className="explore-btn" onClick={() => navigate('/category')}>
                                    Browse Menu
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* invoice/detail modal */}
            {selectedOrder && (
                <div className="invoice-modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="invoice-modal" onClick={e => e.stopPropagation()}>
                        <header>
                            <h2>Invoice Details</h2>
                            <button className="close-btn" onClick={() => setSelectedOrder(null)}>×</button>
                        </header>

                        <section className="bill-section">
                            <h3>Bill From:</h3>
                            <p>Crispydosa Kitchen Limited</p>
                            <p>20, Portman Road Reading, RG30 1Ea, United Kingdom</p>
                        </section>

                        <section className="bill-section" style={{marginTop:'1rem'}}>
                            <h3>Bill To:</h3>
                            <p><strong>Name:</strong> {selectedOrder.name}</p>
                            {selectedOrder.email && <p><strong>Email:</strong> {selectedOrder.email}</p>}
                            {selectedOrder.phone && <p><strong>Phone:</strong> {selectedOrder.phone}</p>}
                            {selectedOrder.address && <p><strong>Address:</strong> {selectedOrder.address}</p>}
                        </section>

                        <table>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Price (Excl VAT)</th>
                                    <th>VAT</th>
                                    <th>Price (Inc VAT)</th>
                                    <th>Qty</th>
                                    <th>Units</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedOrder.items.map((item, i) => {
                                    // prefer explicit stored values when present
                                    const base = item.priceExclVAT ?? item.unitPrice ?? item.actualPrice ?? item.price ?? 0;
                                    const vatAmt = item.vatAmount != null ? item.vatAmount : parseFloat((base * 0.20).toFixed(2));
                                    const inc = item.priceInclVAT != null ? item.priceInclVAT : parseFloat((base + vatAmt).toFixed(2));
                                    const totalLine = item.totalPrice != null ? item.totalPrice : parseFloat((inc * item.quantity).toFixed(2));
                                    return (
                                        <tr key={i}>
                                            <td>{item.title || item.brand}</td>
                                            <td>{formatCurrency(base)}</td>
                                            <td>{formatCurrency(vatAmt)}</td>
                                            <td>{formatCurrency(inc)}</td>
                                            <td>{item.quantity}</td>
                                            <td>{item.units || 'KG'}</td>
                                            <td>{formatCurrency(totalLine)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        <div className="invoice-summary">
                            <p>Subtotal: {formatCurrency(selectedOrder.subtotal)}</p>
                            <p>Tax: {formatCurrency(selectedOrder.tax)}</p>
                            <p><strong>Total: {formatCurrency(selectedOrder.totalPrice)}</strong></p>
                        </div>

                        <div className="invoice-actions" style={{textAlign:'right',marginTop:'1rem'}}>
                            <button onClick={() => setSelectedOrder(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
