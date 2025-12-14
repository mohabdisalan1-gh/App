import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FiGrid, FiFolder, FiStar, FiClock, FiSettings,
    FiLogOut, FiMenu, FiX, FiSearch, FiSun, FiMoon
} from 'react-icons/fi';
import '../index.css';

export default function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const { logout, currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    async function handleLogout() {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    }

    function toggleDarkMode() {
        setDarkMode(!darkMode);
        if (!darkMode) {
            document.body.setAttribute('data-theme', 'dark');
        } else {
            document.body.removeAttribute('data-theme');
        }
    }

    const navItems = [
        { label: 'Dashboard', icon: FiGrid, path: '/' },
        { label: 'Subjects', icon: FiFolder, path: '/subjects' },
        { label: 'Favorites', icon: FiStar, path: '/favorites' },
        { label: 'Recent', icon: FiClock, path: '/recent' },
    ];

    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-body)' }}>
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 40,
                        backdropFilter: 'blur(4px)',
                        display: window.innerWidth > 768 ? 'none' : 'block'
                    }}
                />
            )}

            {/* Sidebar */}
            <aside style={{
                backgroundColor: 'var(--bg-sidebar)',
                color: '#fff',
                width: '260px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                zIndex: 50,
                transition: 'transform 0.3s ease',
                transform: sidebarOpen || window.innerWidth > 768 ? 'translateX(0)' : 'translateX(-100%)',
                boxShadow: '4px 0 24px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem', paddingLeft: '0.5rem' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
                        borderRadius: '8px'
                    }}></div>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.5px' }}>PDF Master</h1>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            to={item.path}
                            onClick={() => window.innerWidth <= 768 && setSidebarOpen(false)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.85rem 1rem',
                                borderRadius: '0.75rem',
                                color: location.pathname === item.path ? '#fff' : 'var(--text-secondary)',
                                backgroundColor: location.pathname === item.path ? 'var(--color-primary)' : 'transparent',
                                fontWeight: location.pathname === item.path ? '600' : '400',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </Link>
                    ))}

                    <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                        <button
                            onClick={handleLogout}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.85rem 1rem',
                                borderRadius: '0.75rem',
                                color: '#ef4444',
                                backgroundColor: 'transparent',
                                textAlign: 'left',
                                fontSize: '0.95rem'
                            }}
                        >
                            <FiLogOut size={20} />
                            Sign Out
                        </button>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main style={{
                flex: 1,
                marginLeft: window.innerWidth > 768 ? '260px' : '0',
                width: '100%',
                transition: 'margin-left 0.3s ease'
            }}>
                {/* Top Header */}
                <header style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 30,
                    backgroundColor: 'var(--bg-body)',
                    padding: '1rem 2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid transparent' // Placeholder for scroll effect if needed
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={() => setSidebarOpen(true)}
                            style={{ display: window.innerWidth > 768 ? 'none' : 'block', background: 'none', color: 'var(--text-main)' }}
                        >
                            <FiMenu size={24} />
                        </button>
                        <div style={{ position: 'relative', width: '300px', display: ['none', 'block'] }}>
                            <FiSearch style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="text"
                                placeholder="Search files..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearch}
                                style={{
                                    width: '100%',
                                    padding: '0.65rem 1rem 0.65rem 2.5rem',
                                    borderRadius: '2rem',
                                    border: '1px solid var(--border-light)',
                                    backgroundColor: 'var(--bg-surface)',
                                    color: 'var(--text-main)',
                                    boxShadow: 'var(--shadow-sm)'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <button
                            onClick={toggleDarkMode}
                            style={{
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border-light)',
                                padding: '0.5rem',
                                borderRadius: '50%',
                                color: 'var(--text-main)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--color-primary)',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '600',
                                fontSize: '1.1rem'
                            }}>
                                {currentUser?.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                            </div>
                            <div style={{ display: window.innerWidth > 768 ? 'block' : 'none' }}>
                                <p style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-main)' }}>{currentUser?.displayName || 'User'}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Student</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div style={{ padding: '2rem' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
