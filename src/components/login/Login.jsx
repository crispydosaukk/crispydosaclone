import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import './Login.css';

const Login = ({ setUser, fetchCart }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    React.useEffect(() => {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        if (isAuthenticated) {
            navigate('/homepage');
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log("DEBUG LOGIN: --- Start ---");
            console.log("DEBUG LOGIN: Project ID:", db.app.options.projectId);
            console.log("DEBUG LOGIN: Email:", email);

            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", email));
            console.log("DEBUG LOGIN: Fetching from 'users' where email == ", email);
            const snapshot = await getDocs(q);

            console.log("DEBUG LOGIN: Found docs count:", snapshot.size);

            if (snapshot.empty) {
                console.warn("DEBUG LOGIN: No user found matching that email.");
                setError('Invalid email or password');
                return;
            }

            let userFound = null;
            snapshot.forEach(doc => {
                const data = doc.data();
                console.log("DEBUG LOGIN: Comparing passwords for user:", doc.id);
                if (data.password === password) {
                    userFound = { id: doc.id, ...data };
                }
            });

            if (userFound) {
                console.log("DEBUG LOGIN: SUCCESS!");
                delete userFound.password;
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('user', JSON.stringify(userFound));
                // update parent app state and fetch cart right away
                if (setUser) setUser(userFound);
                if (fetchCart) fetchCart(userFound.id);
                navigate('/homepage');
            } else {
                console.warn("DEBUG LOGIN: Password mismatch.");
                setError('Invalid email or password');
            }
        } catch (err) {
            console.error('DEBUG LOGIN ERROR:', err);
            setError('Login Failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-background">
                <div className="shape circle-1"></div>
                <div className="shape circle-2"></div>
                <div className="shape circle-3"></div>
            </div>

            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <div className="login-logo">
                            <img src="/svb_logo.svg" alt="Saravana Bhavan Logo" className="login-logo-img" />
                        </div>
                        <h2>Welcome Back</h2>
                        <p>Experience the crunch, anywhere you are.</p>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <form className="login-form" onSubmit={handleLogin}>
                        <div className="input-group">
                            <label>Email Address</label>
                            <div className="input-wrapper">
                                <Mail className="input-icon" size={20} />
                                <input
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <div className="input-wrapper">
                                <Lock className="input-icon" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                    required
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="form-options">
                            <label className="remember-me">
                                <input type="checkbox" />
                                <span>Remember me</span>
                            </label>
                            <a href="#" className="forgot-password">Forgot password?</a>
                        </div>

                        <button type="submit" className="login-button" disabled={loading}>
                            {loading ? (
                                <><Loader2 className="animate-spin" size={20} /> Signing In...</>
                            ) : (
                                <>Sign In <ArrowRight size={20} /></>
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>Don't have an account? <a href="#">Create one now</a></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
