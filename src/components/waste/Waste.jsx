import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Camera, Trash2, History, Plus, Minus, Image as ImageIcon, Send, X, CheckCircle } from 'lucide-react';

import './Waste.css';

const Waste = () => {
    const [view, setView] = useState('form'); // 'form' or 'history'
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [wasteItems, setWasteItems] = useState([]);
    const [photo, setPhoto] = useState(null);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    // load categories and also restore view preference
    useEffect(() => {
        fetchCategories();
        const savedView = localStorage.getItem('wasteView');
        if (savedView === 'history' || savedView === 'form') {
            setView(savedView);
        }
    }, []);

    const fetchCategories = async () => {
        try {
            const { collection, getDocs } = await import('firebase/firestore');
            const { db } = await import('../../firebase');

            // Using inventoryCategory based on screenshot
            const snapshot = await getDocs(collection(db, "inventoryCategory"));
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            setCategories(data);
            if (data.length > 0) {
                setSelectedCategoryId(data[0].id);
                fetchItems(data[0].id);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const fetchItems = async (catId) => {
        try {
            const { collection, query, where, getDocs } = await import('firebase/firestore');
            const { db } = await import('../../firebase');

            // Using inventoryItems based on screenshot
            const q = query(collection(db, "inventoryItems"), where("categoryId", "==", catId));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            setItems(data);
        } catch (error) {
            console.error("Error fetching items:", error);
        }
    };

    const fetchHistory = async () => {
        setHistoryLoading(true);
        try {
            const savedUser = localStorage.getItem('user');
            if (!savedUser) return;
            const userId = JSON.parse(savedUser).id;

            const { collection, query, where, getDocs } = await import('firebase/firestore');
            const { db } = await import('../../firebase');

            // avoid composite index by omitting orderBy/limit – we'll sort in memory
            const q = query(collection(db, "wastage"), where("userId", "==", userId));
            const snapshot = await getDocs(q);
            let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // sort newest first and keep the most recent 20
            data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            data = data.slice(0, 20);

            // if for some reason there are no docs yet, retain any existing local entries
            if (data.length > 0) {
                setHistory(data);
            }
        } catch (error) {
            console.error("Error fetching waste history:", error);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleCategoryChange = (e) => {
        const catId = e.target.value;
        setSelectedCategoryId(catId);
        fetchItems(catId);
    };

    const addToWaste = (item) => {
        setWasteItems(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const updateWasteQty = (id, delta) => {
        setWasteItems(prev => {
            const existing = prev.find(i => i.id === id);
            if (!existing) return prev;
            const newQty = Math.max(0, existing.quantity + delta);
            if (newQty === 0) return prev.filter(i => i.id !== id);
            return prev.map(i => i.id === id ? { ...i, quantity: newQty } : i);
        });
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (wasteItems.length === 0) {
            alert("Please add at least one item to waste.");
            return;
        }

        setLoading(true);
        try {
            const { collection, addDoc } = await import('firebase/firestore');
            const { db } = await import('../../firebase');

            const savedUser = localStorage.getItem('user');
            const user = savedUser ? JSON.parse(savedUser) : null;

            const record = {
                userId: user?.id,
                name: user?.name,
                restaurantName: user?.restaurantName,
                items: wasteItems,
                photo,
                reason,
                createdAt: new Date().toISOString(),
                status: "submitted"
            };

            const docRef = await addDoc(collection(db, "wastage"), record);

            // add to local history immediately if we're viewing history (or for later retrieval)
            const savedRecord = { id: docRef.id, ...record };
            setHistory(prev => [savedRecord, ...prev]);

            setShowSuccess(true);
            setWasteItems([]);
            setPhoto(null);
            setReason('');
            // move user to history tab so they immediately see the new entry
            setView('history');
            fetchHistory();
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error("Error submitting waste:", error);
            alert("Failed to submit waste record.");
        } finally {
            setLoading(false);
        }
    };

    const toggleView = () => {
        if (view === 'form') {
            setView('history');
        } else {
            setView('form');
        }
    };

    // whenever view changes we save it and fetch history if needed
    useEffect(() => {
        localStorage.setItem('wasteView', view);
        if (view === 'history') {
            fetchHistory();
        }
    }, [view]);

    return (
        <div className="waste-page">
            <main className="waste-container">
                <div className="page-title-section">
                    <h1>Waste <span className="highlight">Management</span></h1>
                    <button className="history-toggle-btn" onClick={toggleView}>
                        {view === 'form' ? <><History size={18} /> View History</> : <><Plus size={18} /> Record Waste</>}
                    </button>
                </div>

                {view === 'form' ? (
                    <div className="waste-form card-anim">
                        <section className="selection-section">
                            <label>Select Category</label>
                            <select value={selectedCategoryId} onChange={handleCategoryChange}>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.category}</option>
                                ))}
                            </select>

                            <div className="items-selector-grid">
                                {items.map(item => (
                                    <div key={item.id} className="quick-item-chip" onClick={() => addToWaste(item)}>
                                        {item.title || item.brand}
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="added-waste-section">
                            <h3>Recorded Items</h3>
                            {wasteItems.length > 0 ? (
                                <div className="waste-items-list">
                                    {wasteItems.map(item => (
                                        <div key={item.id} className="waste-item-row">
                                            <span>{item.title || item.brand}</span>
                                            <div className="qty-controls">
                                                <button onClick={() => updateWasteQty(item.id, -1)}><Minus size={14} /></button>
                                                <span>{item.quantity}{item.units || 'kg'}</span>
                                                <button onClick={() => updateWasteQty(item.id, 1)}><Plus size={14} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="empty-msg">No items added yet. Choose from above.</p>
                            )}
                        </section>

                        <section className="photo-section">
                            <label>Attach Evidence (Photo)</label>
                            <div className="photo-upload-container" onClick={() => fileInputRef.current.click()}>
                                {photo ? (
                                    <div className="photo-preview">
                                        <img src={photo} alt="Waste evidence" />
                                        <button className="remove-photo" onClick={(e) => {
                                            e.stopPropagation();
                                            setPhoto(null);
                                        }}><X size={16} /></button>
                                    </div>
                                ) : (
                                    <div className="upload-placeholder">
                                        <Camera size={32} />
                                        <span>Click to Upload from Gallery/Camera</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    hidden
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                />
                            </div>
                        </section>

                        <section className="reason-section">
                            <label>Reason / Notes</label>
                            <textarea
                                placeholder="Why is this being recorded as waste? (e.g. Damage, Expiry)"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </section>

                        <button className="submit-waste-btn" onClick={handleSubmit} disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Submit Waste Record</>}
                        </button>
                    </div>
                ) : (
                    <div className="waste-history card-anim">
                        <h3>Previous Waste Records</h3>
                        {historyLoading ? (
                            <div className="loader-container">
                                <Loader2 className="animate-spin" size={48} />
                                <p>Loading history...</p>
                            </div>
                        ) : (
                            <div className="history-list">
                                {history.length > 0 ? history.map((record, index) => (
                                    <div key={record.id} className="history-card" style={{ animationDelay: `${index * 0.1}s` }}>
                                        <div className="history-card-top">
                                            <span className="record-date">{new Date(record.createdAt).toLocaleString()}</span>
                                            <span className="record-status">{record.status}</span>
                                        </div>
                                        <div className="history-items">
                                            {record.items.map(i => `${i.title || i.brand} (${i.quantity}${i.units || 'kg'})`).join(', ')}
                                        </div>
                                        {record.photo && (
                                            <div className="history-photo">
                                                <ImageIcon size={14} /> Photo Attached
                                            </div>
                                        )}
                                        <div className="history-reason">Reason: {record.reason}</div>
                                    </div>
                                )) : (
                                    <p className="no-history">No previous records found.</p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Success Overlay */}
            {showSuccess && (
                <div className="waste-success-overlay">
                    <div className="success-content animated-bounceIn">
                        <CheckCircle size={64} color="#4CAF50" />
                        <h2>Submitted!</h2>
                        <p>Waste record has been saved successfully.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Waste;
