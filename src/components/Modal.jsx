import React from 'react';
import { FiX } from 'react-icons/fi';

export default function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        }}>
            <div
                onClick={onClose}
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(4px)'
                }}
            />
            <div style={{
                position: 'relative',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: '1rem',
                padding: '2rem',
                width: '100%',
                maxWidth: '500px',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border-light)',
                animation: 'scaleIn 0.2s ease'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{title}</h3>
                    <button onClick={onClose} style={{ color: 'var(--text-secondary)', background: 'none' }}>
                        <FiX size={24} />
                    </button>
                </div>
                {children}
            </div>
            <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
        </div>
    );
}
