import React from 'react';
import { FiFileText, FiMoreVertical, FiStar, FiTrash2, FiDownload, FiEye, FiCheck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function FileItem({ file, onDelete, onToggleStar, isSelectionMode, isSelected, onSelect }) {
    const navigate = useNavigate();

    const handleOpen = () => {
        if (isSelectionMode) {
            onSelect();
        } else {
            navigate(`/view/${file.id}`, { state: { file } });
        }
    };

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '1rem',
            backgroundColor: isSelected ? 'rgba(79, 70, 229, 0.05)' : 'var(--bg-surface)',
            borderRadius: '0.75rem',
            border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--border-light)',
            justifyContent: 'space-between',
            transition: 'all 0.2s',
            cursor: 'pointer' // Always clickable now
        }}
            onMouseEnter={(e) => !isSelected && (e.currentTarget.style.backgroundColor = 'var(--bg-body)')}
            onMouseLeave={(e) => !isSelected && (e.currentTarget.style.backgroundColor = 'var(--bg-surface)')}
            onClick={handleOpen} // Main container click handles select or open
        >
            {/* Clickable Info Area */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    flex: 1,
                    minWidth: 0,
                }}
            >
                {/* Selection Checkbox */}
                {isSelectionMode && (
                    <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        border: isSelected ? 'none' : '2px solid var(--text-secondary)',
                        backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        marginRight: '0.5rem'
                    }}>
                        {isSelected && <FiCheck size={14} />}
                    </div>
                )}

                <div style={{
                    padding: '0.75rem',
                    backgroundColor: '#fef2f2', // Light red for PDF
                    color: '#ef4444',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <FiFileText size={20} />
                </div>
                <div style={{ minWidth: 0 }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '500', marginBottom: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {formatSize(file.size)} • {
                            file.createdAt?.seconds ?
                                new Date(file.createdAt.seconds * 1000).toLocaleDateString() :
                                new Date(file.createdAt || Date.now()).toLocaleDateString()
                        }
                    </p>
                </div>
            </div>

            {/* Separate Actions Area - High Z-Index Safe Zone */}
            {!isSelectionMode && (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginLeft: '1rem',
                        position: 'relative',
                        zIndex: 20
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()} // Prevent drag start or focus steal
                >
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleStar(file);
                        }}
                        style={{
                            padding: '0.6rem', // Larger touch target
                            borderRadius: '0.5rem',
                            color: file.isStarred ? '#eab308' : 'var(--text-secondary)',
                            background: 'transparent',
                            cursor: 'pointer',
                            border: '1px solid transparent', // Prevent layout shift on hover
                            zIndex: 21
                        }}
                        title={file.isStarred ? "Unstar" : "Star"}
                    >
                        <FiStar fill={file.isStarred ? "currentColor" : "none"} size={18} />
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            // Direct call, minimal logic to prevent errors
                            if (window.confirm(`Delete ${file.name}?`)) {
                                onDelete(file);
                            }
                        }}
                        style={{
                            padding: '0.6rem', // Larger touch target
                            borderRadius: '0.5rem',
                            color: '#ef4444', // Red for delete
                            backgroundColor: 'rgba(239, 68, 68, 0.1)', // Subtle red background
                            cursor: 'pointer',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            zIndex: 21
                        }}
                        title="Delete"
                    >
                        <FiTrash2 size={18} />
                    </button>
                </div>
            )}
        </div >
    );
}

