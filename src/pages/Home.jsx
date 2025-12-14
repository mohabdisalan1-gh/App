import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeToSubjects, addSubject, subscribeToAllUserFiles } from '../services/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiFolder, FiFileText, FiHardDrive, FiStar } from 'react-icons/fi';
import Modal from '../components/Modal';
import '../index.css';

export default function Home() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [subjects, setSubjects] = useState([]);
    const [allFiles, setAllFiles] = useState([]);

    const [loadingSubjects, setLoadingSubjects] = useState(true);
    const [loadingFiles, setLoadingFiles] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newSubjectName, setNewSubjectName] = useState('');
    const [creating, setCreating] = useState(false);

    // Subscribe to Subjects
    useEffect(() => {
        if (currentUser) {
            const unsubscribe = subscribeToSubjects(currentUser.uid, (data) => {
                setSubjects(data);
                setLoadingSubjects(false);
            }, (error) => {
                console.error("Subject subscription error:", error);
                setLoadingSubjects(false);
                alert("Error loading subjects: " + error.message);
            });
            return () => unsubscribe();
        }
    }, [currentUser]);

    // Subscribe to All Files (for Stats & Recent)
    useEffect(() => {
        if (currentUser) {
            const unsubscribe = subscribeToAllUserFiles(currentUser.uid, (data) => {
                setAllFiles(data || []);
                setLoadingFiles(false);
            });
            return () => unsubscribe();
        }
    }, [currentUser]);

    // Computed Stats
    const totalFiles = allFiles.length;
    const starredFiles = allFiles.filter(f => f.isStarred).length;
    const totalSize = allFiles.reduce((acc, file) => acc + (file.size || 0), 0);
    const recentFiles = allFiles.slice(0, 5); // Already sorted by date in DB service

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    async function handleCreateSubject(e) {
        e.preventDefault();
        if (!newSubjectName.trim()) return;

        setCreating(true);
        try {
            await addSubject(currentUser.uid, newSubjectName);
            setNewSubjectName('');
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to create subject", error);
        } finally {
            setCreating(false);
        }
    }

    // Predefined colors for folders
    const folderColors = ['#4f46e5', '#db2777', '#059669', '#d97706', '#7c3aed', '#2563eb'];

    return (
        <div style={{ paddingBottom: '2rem' }}>
            {/* Header */}
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Dashboard</h2>

            {/* Quick Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2.5rem'
            }}>
                <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--color-primary)', borderRadius: '0.75rem' }}>
                        <FiFileText size={24} />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Total Files</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>{totalFiles}</p>
                    </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', backgroundColor: 'rgba(5, 150, 105, 0.1)', color: '#059669', borderRadius: '0.75rem' }}>
                        <FiHardDrive size={24} />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Storage Used</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>{formatSize(totalSize)}</p>
                    </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', backgroundColor: 'rgba(234, 179, 8, 0.1)', color: '#eab308', borderRadius: '0.75rem' }}>
                        <FiStar size={24} />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Starred Items</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>{starredFiles}</p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>
                {/* Left Column: Subjects */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Your Subjects</h3>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                backgroundColor: 'var(--color-primary)', color: '#fff',
                                padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: '600'
                            }}
                        >
                            <FiPlus size={18} /> New Subject
                        </button>
                    </div>

                    {loadingSubjects ? (
                        <p style={{ color: 'var(--text-secondary)' }}>Loading subjects...</p>
                    ) : subjects.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', border: '2px dashed var(--border-light)', borderRadius: '1rem', backgroundColor: 'var(--bg-surface)' }}>
                            <FiFolder size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                            <p style={{ color: 'var(--text-secondary)' }}>No subjects found. Create one to get started!</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                            {subjects.map((subject, index) => (
                                <Link
                                    key={subject.id}
                                    to={`/subject/${subject.id}`}
                                    state={{ subjectName: subject.name }}
                                    style={{
                                        backgroundColor: 'var(--bg-surface)',
                                        padding: '1.25rem',
                                        borderRadius: '0.75rem',
                                        border: '1px solid var(--border-light)',
                                        display: 'flex', flexDirection: 'column', gap: '0.75rem',
                                        transition: 'transform 0.2s',
                                        color: 'inherit', textDecoration: 'none'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <FiFolder size={32} color={folderColors[index % folderColors.length]} />
                                    <span style={{ fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subject.name}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Recent Activity */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Recent Uploads</h3>
                        <Link to="/recent" style={{ fontSize: '0.9rem', color: 'var(--color-primary)', textDecoration: 'none' }}>View All</Link>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {loadingFiles ? (
                            <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
                        ) : recentFiles.length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No recent files.</p>
                        ) : (
                            recentFiles.map(file => (
                                <div
                                    key={file.id}
                                    onClick={() => navigate(`/view/${file.id}`, { state: { file } })}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                                        padding: '0.75rem', backgroundColor: 'var(--bg-surface)',
                                        borderRadius: '0.5rem', border: '1px solid var(--border-light)',
                                        fontSize: '0.9rem', cursor: 'pointer'
                                    }}
                                >
                                    <div style={{ padding: '0.4rem', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '0.3rem' }}>
                                        <FiFileText size={16} />
                                    </div>
                                    <div style={{ overflow: 'hidden', flex: 1 }}>
                                        <p style={{ fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            {new Date(file.createdAt?.seconds ? file.createdAt.seconds * 1000 : (file.createdAt || Date.now())).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Add Subject Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Subject">
                <form onSubmit={handleCreateSubject}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Subject Name</label>
                        <input
                            type="text"
                            autoFocus
                            value={newSubjectName}
                            onChange={(e) => setNewSubjectName(e.target.value)}
                            placeholder="e.g. Mathematics, Physics..."
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                border: '1px solid var(--border-light)',
                                backgroundColor: 'var(--bg-body)',
                                color: 'var(--text-main)',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            style={{
                                padding: '0.6rem 1rem',
                                borderRadius: '0.5rem',
                                backgroundColor: 'transparent',
                                color: 'var(--text-secondary)'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={creating || !newSubjectName.trim()}
                            style={{
                                padding: '0.6rem 1rem',
                                borderRadius: '0.5rem',
                                backgroundColor: 'var(--color-primary)',
                                color: '#fff',
                                fontWeight: '600',
                                opacity: creating ? 0.7 : 1
                            }}
                        >
                            {creating ? 'Creating...' : 'Create Subject'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
