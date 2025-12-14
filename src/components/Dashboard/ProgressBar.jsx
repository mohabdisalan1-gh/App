import React from 'react';
import { FiFile } from 'react-icons/fi';

export default function ProgressBar({ file, progress }) {
    return (
        <div style={{
            padding: '0.75rem',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '0.5rem',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '0.5rem'
        }}>
            <div style={{
                padding: '0.5rem',
                backgroundColor: 'var(--bg-body)',
                borderRadius: '0.25rem',
                color: 'var(--color-primary)'
            }}>
                <FiFile />
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{file.name}</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{Math.round(progress)}%</span>
                </div>
                <div style={{
                    width: '100%',
                    height: '4px',
                    backgroundColor: 'var(--bg-body)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        backgroundColor: 'var(--color-primary)',
                        transition: 'width 0.2s ease'
                    }} />
                </div>
            </div>
        </div>
    );
}
