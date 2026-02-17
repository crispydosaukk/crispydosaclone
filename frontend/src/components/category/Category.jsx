import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Search, ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '../../config';
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
            const response = await fetch(`${API_BASE_URL}/api/categories`);
            const data = await response.json();
            if (Array.isArray(data)) {
                setCategories(data);
            } else {
                console.error("Unexpected data format:", data);
                setCategories([]);
            }
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
            {/* Header */}
            <header className="category-header">
                <div className="header-content">
                    <button className="back-btn" onClick={() => navigate('/')}>
                        <ArrowLeft size={24} />
                    </button>
                    <h1>Our <span className="highlight">Menu</span> Categories</h1>
                    <p>Discover our wide range of authentic South Indian delights</p>

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
            </header>

            {/* Content */}
            <main className="category-container">
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
                <p>&copy; 2024 Saravana Bhavan. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Category;
