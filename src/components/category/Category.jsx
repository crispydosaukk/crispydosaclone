import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Search, ChevronRight } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import './Category.css';

const Category = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            // Using the collection name visible in the screenshot
            const ref = collection(db, "inventoryCategory");
            const snapshot = await getDocs(ref);

            if (snapshot.empty) {
                console.warn("No categories found in 'inventoryCategory'");
                setCategories([]);
                return;
            }

            const data = snapshot.docs.map(doc => {
                const docData = doc.data();
                return {
                    id: doc.id,
                    category: docData.category,
                    image: docData.image,
                    ...docData
                };
            });

            // Sort categories alphabetically if needed
            data.sort((a, b) => (a.category || "").localeCompare(b.category || ""));

            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="category-page">
            <main className="category-container">
                <div className="page-title-section">
                    <h1><span className="highlight">Menu Categories</span> </h1>
                    <div className="search-bar">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Content */}

                {loading ? (
                    <div className="loader-container">
                        <Loader2 className="animate-spin" size={48} />
                        <p>Loading our delicious menu...</p>
                    </div>
                ) : (
                    <div className="category-grid">
                        {filteredCategories.map((cat, index) => (
                            <div
                                key={cat.id || index}
                                className="cat-card"
                                style={{ animationDelay: `${index * 0.1}s` }}
                                onClick={() => navigate(`/items/${cat.id}`)}
                            >
                                <div className="cat-image-wrapper">
                                    <img
                                        src={cat.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                                        alt={cat.category}
                                        onError={(e) => {
                                            e.target.src = 'https://images.unsplash.com/photo-1541014741259-df549fb9922d?q=80&w=400&auto=format&fit=crop';
                                        }}
                                    />
                                    <div className="cat-overlay">
                                        <button className="view-items-btn">
                                            View Items <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div className="cat-info">
                                    <h3>{cat.category}</h3>
                                    <div className="cat-stats">
                                        <span>Authentic Taste</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && filteredCategories.length === 0 && (
                    <div className="no-results">
                        <h3>No categories found matching "{searchQuery}"</h3>
                        <button className="clear-search" onClick={() => setSearchQuery('')}>
                            View All Categories
                        </button>
                    </div>
                )}
            </main>

            <footer className="category-footer">
                <p>&copy; 2026 Saravana Bhavan. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Category;
