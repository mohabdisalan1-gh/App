import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeToSubjects, addSubject } from '../services/firestore';
import { Link } from 'react-router-dom';
import { FiPlus, FiFolder } from 'react-icons/fi';
import Modal from '../components/Modal';
import '../index.css';

export default function Subjects() {
    const { currentUser } = useAuth();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newSubjectName, setNewSubjectName] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (currentUser) {
            const unsubscribe = subscribeToSubjects(currentUser.uid, (data) => {
                setSubjects(data);
                setLoading(false);
            });
            return () => unsubscribe();
        }
    }, [currentUser]);

    const folderColors = ['#4f46e5', '#db2777', '#059669', '#d97706', '#7c3aed', '#2563eb'];

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

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', backgroundColor: '#e0e7ff', color: '#4f46e5', borderRadius: '0.75rem' }}>
                        <FiFolder size={24} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Subjects</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Manage your folders</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        backgroundColor: 'var(--color-primary)', color: '#fff',
                        padding: '0.6rem 1.25rem', borderRadius: '0.5rem', fontWeight: '600',
                        boxShadow: 'var(--shadow-sm)'
                    }}
                >
                    <FiPlus size={20} /> New Subject
                </button>
            </div>

            {/* Subjects Grid */}
            {loading ? (
                <p style={{ color: 'var(--text-secondary)' }}>Loading subjects...</p>
            ) : subjects.length === 0 ? (
                <div style={{ padding: '4rem', textAlign: 'center', backgroundColor: 'var(--bg-surface)', borderRadius: '1rem', border: '2px dashed var(--border-light)' }}>
                    <FiFolder size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>No subjects yet.</p>
                    <p style={{ color: 'var(--text-tertiary)', marginBottom: '1.5rem' }}>Create a subject to start organizing your files.</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        style={{ color: 'var(--color-primary)', fontWeight: '600' }}
                    >
                        + Create Your First Subject
                    </button>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {subjects.map((subject, index) => (
                        <Link
                            key={subject.id}
                            to={`/subject/${subject.id}`}
                            state={{ subjectName: subject.name }}
                            style={{
                                backgroundColor: 'var(--bg-surface)',
                                padding: '1.5rem',
                                borderRadius: '1rem',
                                border: '1px solid var(--border-light)',
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center', gap: '1rem',
                                transition: 'all 0.2s',
                                color: 'inherit', textDecoration: 'none',
                                textAlign: 'center',
                                boxShadow: 'var(--shadow-sm)'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                            }}
                        >
                            <div style={{
                                width: '64px', height: '64px',
                                backgroundColor: `${folderColors[index % folderColors.length]}15`, // Keep opacity 
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: folderColors[index % folderColors.length]
                            }}>
                                <FiFolder size={32} />
                            </div>
                            <span style={{ fontWeight: '600', fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                                {subject.name}
                            </span>
                        </Link>
                    ))}
                </div>
            )}

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
