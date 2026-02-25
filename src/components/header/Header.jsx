import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Menu, X, ShoppingBag, LogOut, Phone, Store, UserCircle, MapPin, Clock, Trash2 } from 'lucide-react';
import './Header.css';

const Header = ({ cart = [] }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    const shouldHide = location.pathname === '/login';

    // all hooks must run unconditionally so we don't change the hook count
    useEffect(() => {
        if (shouldHide) {
            // if header is hidden we don't need to register listeners
            return;
        }

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
    }, [shouldHide]);

    if (shouldHide) return null;

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
        <>
            <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
                <div className="nav-container">
                    <div className="logo-section" onClick={() => navigate('/')}>
                        <img src="/svb_logo.svg" alt="Saravana Bhavan Logo" className="nav-logo-img" />
                    </div>

                    {/* Desktop Nav Links */}
                    <div className="nav-links desktop-only">
                        <button onClick={() => navigate('/')} className={`nav-link-btn ${location.pathname === '/' || location.pathname === '/homepage' ? 'active' : ''}`}>Home</button>
                        <button onClick={() => navigate('/category')} className={`nav-link-btn ${location.pathname === '/category' ? 'active' : ''}`}>Menu</button>
                        <button onClick={() => navigate('/orders')} className={`nav-link-btn ${location.pathname === '/orders' ? 'active' : ''}`}>My Orders</button>
                        <button onClick={() => navigate('/waste')} className={`nav-link-btn ${location.pathname === '/waste' ? 'active' : ''}`}>Waste Records</button>
                    </div>

                    <div className="nav-actions">
                        {/* cart icon (desktop and mobile) */}
                    <button className="icon-button" onClick={() => navigate('/addtocart')}>
                        <ShoppingBag size={20} />
                        {cart.length > 0 && <span className="cart-badge">{cart.reduce((acc,item)=>acc+item.quantity,0)}</span>}
                    </button>

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

                    {/* Mobile Menu Toggle */}
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
                                <button onClick={() => { navigate('/'); toggleMenu(); }} className="sidebar-link-btn">Home</button>
                                <button onClick={() => { navigate('/addtocart'); toggleMenu(); }} className="sidebar-link-btn">
                                    <ShoppingBag size={18} /> Cart
                                    {cart.length > 0 && <span className="cart-badge sidebar-badge">{cart.reduce((a,i)=>a+i.quantity,0)}</span>}
                                </button>
                                <button onClick={() => { navigate('/category'); toggleMenu(); }} className="sidebar-link-btn"><ShoppingBag size={18} /> Menu</button>
                                <button onClick={() => { navigate('/orders'); toggleMenu(); }} className="sidebar-link-btn"><Clock size={18} /> My Orders</button>
                                <button onClick={() => { navigate('/waste'); toggleMenu(); }} className="sidebar-link-btn"><Trash2 size={18} /> Waste Records</button>
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
            {/* Spacer to prevent content from being hidden behind sticky navbar */}
            <div className="navbar-spacer"></div>
        </>
    );
};

export default Header;
