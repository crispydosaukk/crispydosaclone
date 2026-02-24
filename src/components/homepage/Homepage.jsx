import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Menu, X, ShoppingBag, LogOut, Phone, Store, UserCircle, MapPin, Clock, Trash2 } from 'lucide-react';
import './Homepage.css';

const Homepage = () => {
    const navigate = useNavigate();
    return (
        <div className="homepage-container">
            <header className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Experience the Authentic Taste of <span className="highlight">Saravana Bhavan</span></h1>
                    <p className="hero-subtitle">Mouth-watering South Indian delicacies, crafted with love and tradition.</p>
                    <div className="hero-buttons">
                        <button className="cta-button" onClick={() => navigate('/category')}>Explore Menu</button>
                        <button className="secondary-button" onClick={() => navigate('/waste')}>Record Waste</button>
                    </div>
                </div>
            </header>

            <footer className="homepage-footer">
                <p>&copy; 2026 Saravana Bhavan. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Homepage;
