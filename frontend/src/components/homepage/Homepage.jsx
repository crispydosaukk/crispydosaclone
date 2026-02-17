import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Menu, X, ShoppingBag, LogOut, Phone, Store, UserCircle, MapPin } from 'lucide-react';
import './Homepage.css';

const Homepage = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowProfile(false);
            }
        };

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        window.addEventListener('scroll', handleScroll);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        if (showProfile) setShowProfile(false);
    };

    return (
        <div className="homepage-container">
            <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
                <div className="nav-container">
                    <div className="logo-section">
                        <span className="logo-badge">SB</span>
                        <span className="logo-text">SARAVANA<span className="logo-accent">BHAVAN</span></span>
                    </div>

                    {/* Desktop Nav Links */}
                    <div className="nav-links desktop-only">
                        <a href="/" className="nav-link">Home</a>
                        <a href="#menu" className="nav-link">Menu</a>
                        <a href="#about" className="nav-link">About</a>
                        <a href="#locations" className="nav-link">Locations</a>
                        <a href="#contact" className="nav-link">Contact</a>
                    </div>

                    <div className="nav-actions">
                        <button className="icon-button desktop-only"><ShoppingBag size={20} /></button>

                        {/* Desktop Profile */}
                        <div className="profile-wrapper desktop-only" ref={dropdownRef}>
                            <button
                                className={`icon-button account-btn ${showProfile ? 'active' : ''}`}
                                onClick={() => setShowProfile(!showProfile)}
                            >
                                <User size={20} />
                            </button>

                            {showProfile && user && (
                                <div className="profile-dropdown">
                                    <div className="dropdown-header">
                                        <div className="user-avatar">
                                            {user.name?.charAt(0) || 'U'}
                                        </div>
                                        <div className="user-info">
                                            <h4>{user.name}</h4>
                                            <p>{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="dropdown-divider"></div>
                                    <div className="dropdown-body">
                                        <div className="profile-item">
                                            <Store size={18} />
                                            <div className="item-text">
                                                <span>Restaurant</span>
                                                <p>{user.restaurantName || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="profile-item">
                                            <Phone size={18} />
                                            <div className="item-text">
                                                <span>Phone</span>
                                                <p>{user.phone || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="profile-item">
                                            <MapPin size={18} />
                                            <div className="item-text">
                                                <span>Address</span>
                                                <p className="address-text">{user.address || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="dropdown-divider"></div>
                                    <button className="logout-btn" onClick={handleLogout}>
                                        <LogOut size={18} />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Toggle - ALWAYS VISIBLE IN NAV CONTAINER */}
                    <button className={`mobile-toggle-btn mobile-only ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>
                        <div className="bar"></div>
                        <div className="bar"></div>
                        <div className="bar"></div>
                    </button>
                </div>

                {/* Mobile Sidebar Overlay */}
                <div className={`mobile-overlay ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}></div>

                {/* Mobile Sidebar */}
                <div className={`mobile-sidebar ${isMenuOpen ? 'open' : ''}`}>
                    <div className="sidebar-header">
                        {user && (
                            <div className="sidebar-user">
                                <div className="user-avatar">
                                    {user.name?.charAt(0) || 'U'}
                                </div>
                                <div className="user-info">
                                    <h4>{user.name}</h4>
                                    <p>{user.email}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="sidebar-content">
                        <div className="sidebar-section">
                            <span className="section-title">Navigation</span>
                            <div className="sidebar-links">
                                <a href="/" onClick={toggleMenu}>Home</a>
                                <a href="#menu" onClick={toggleMenu}><ShoppingBag size={18} /> Menu</a>
                                <a href="#about" onClick={toggleMenu}>About Us</a>
                                <a href="#locations" onClick={toggleMenu}>Our Locations</a>
                                <a href="#contact" onClick={toggleMenu}>Contact</a>
                            </div>
                        </div>

                        {user && (
                            <div className="sidebar-section">
                                <span className="section-title">My Profile</span>
                                <div className="profile-details-mobile">
                                    <div className="p-item">
                                        <Store size={16} />
                                        <div>
                                            <label>Restaurant</label>
                                            <p>{user.restaurantName}</p>
                                        </div>
                                    </div>
                                    <div className="p-item">
                                        <Phone size={16} />
                                        <div>
                                            <label>Phone</label>
                                            <p>{user.phone}</p>
                                        </div>
                                    </div>
                                    <div className="p-item">
                                        <MapPin size={16} />
                                        <div>
                                            <label>Address</label>
                                            <p>{user.address}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="sidebar-footer">
                        <button className="logout-btn-mobile" onClick={handleLogout}>
                            <LogOut size={18} /> Logout
                        </button>
                    </div>
                </div>
            </nav>

            <header className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Experience the Authentic Taste of <span className="highlight">Saravana Bhavan</span></h1>
                    <p className="hero-subtitle">Mouth-watering South Indian delicacies, crafted with love and tradition.</p>
                    <button className="cta-button" onClick={() => navigate('/category')}>Explore Menu</button>
                </div>
            </header>

            <section className="features-section">
                <div className="feature-card">
                    <div className="icon">Authentic</div>
                    <h3>Traditional Recipes</h3>
                    <p>Sourced from the heart of South India to bring you the real taste.</p>
                </div>
                <div className="feature-card">
                    <div className="icon">Fresh</div>
                    <h3>Always Fresh</h3>
                    <p>We use the finest local ingredients to ensure every bite is perfect.</p>
                </div>
                <div className="feature-card">
                    <div className="icon">Quick</div>
                    <h3>Fast Delivery</h3>
                    <p>Get your favorite dosa delivered hot and fresh to your doorstep.</p>
                </div>
            </section>

            <footer className="homepage-footer">
                <p>&copy; 2024 Saravana Bhavan. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Homepage;
