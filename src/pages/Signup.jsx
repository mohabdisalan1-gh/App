import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiAlertCircle } from 'react-icons/fi';
import '../index.css';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        if (password !== passwordConfirm) {
            return setError('Passwords do not match');
        }

        try {
            setError('');
            setLoading(true);
            await signup(email, password, displayName);
            navigate('/');
        } catch (err) {
            console.error(err);
            setError('Failed to create an account. ' + err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: 'var(--bg-body)',
            padding: '1rem'
        }}>
            <div style={{
                backgroundColor: 'var(--bg-surface)',
                padding: '2.5rem',
                borderRadius: '1rem',
                boxShadow: 'var(--shadow-lg)',
                width: '100%',
                maxWidth: '400px',
                border: '1px solid var(--border-light)'
            }}>
                <h2 style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: 'var(--color-primary)',
                    textAlign: 'center',
                    marginBottom: '0.5rem'
                }}>Get Started</h2>
                <p style={{
                    textAlign: 'center',
                    color: 'var(--text-secondary)',
                    marginBottom: '2rem'
                }}>Create your account</p>

                {error && (
                    <div style={{
                        backgroundColor: 'hsl(0, 80%, 95%)',
                        color: 'hsl(0, 60%, 50%)',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        border: '1px solid hsl(0, 80%, 90%)',
                        fontSize: '0.9rem'
                    }}>
                        <FiAlertCircle /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    <div style={{ position: 'relative' }}>
                        <FiUser style={{
                            position: 'absolute',
                            top: '50%',
                            left: '1rem',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-secondary)'
                        }} />
                        <input
                            type="text"
                            placeholder="Full Name"
                            required
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 2.8rem',
                                borderRadius: '0.5rem',
                                border: '1px solid var(--border-light)',
                                backgroundColor: 'var(--bg-body)',
                                color: 'var(--text-main)',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'border-color var(--transition-fast)'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <FiMail style={{
                            position: 'absolute',
                            top: '50%',
                            left: '1rem',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-secondary)'
                        }} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 2.8rem',
                                borderRadius: '0.5rem',
                                border: '1px solid var(--border-light)',
                                backgroundColor: 'var(--bg-body)',
                                color: 'var(--text-main)',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'border-color var(--transition-fast)'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <FiLock style={{
                            position: 'absolute',
                            top: '50%',
                            left: '1rem',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-secondary)'
                        }} />
                        <input
                            type="password"
                            placeholder="Password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 2.8rem',
                                borderRadius: '0.5rem',
                                border: '1px solid var(--border-light)',
                                backgroundColor: 'var(--bg-body)',
                                color: 'var(--text-main)',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'border-color var(--transition-fast)'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <FiLock style={{
                            position: 'absolute',
                            top: '50%',
                            left: '1rem',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-secondary)'
                        }} />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            required
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 2.8rem',
                                borderRadius: '0.5rem',
                                border: '1px solid var(--border-light)',
                                backgroundColor: 'var(--bg-body)',
                                color: 'var(--text-main)',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'border-color var(--transition-fast)'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '0.85rem',
                            borderRadius: '0.5rem',
                            backgroundColor: 'var(--color-primary)',
                            color: '#fff',
                            fontWeight: '600',
                            fontSize: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: loading ? 0.7 : 1,
                            marginTop: '0.5rem'
                        }}
                    >
                        {loading ? 'Sign Up' : 'Create Account'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>Login</Link>
                </div>
            </div>
        </div>
    );
}
