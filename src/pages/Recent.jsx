import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeToAllUserFiles, deleteFileMetadata, toggleFileStar } from '../services/firestore';
import { deleteFileFromStorage } from '../services/storage';
import FileItem from '../components/Dashboard/FileItem';
import { FiClock } from 'react-icons/fi';

export default function Recent() {
    const { currentUser } = useAuth();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            const unsubscribe = subscribeToAllUserFiles(currentUser.uid, (data) => {
                const allFiles = data || [];
                // Sort by createdAt desc
                allFiles.sort((a, b) => {
                    const dateA = new Date(a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (a.createdAt || 0));
                    const dateB = new Date(b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (b.createdAt || 0));
                    return dateB - dateA;
                });
                setFiles(allFiles.slice(0, 20));
                setLoading(false);
            });
            return () => unsubscribe();
        }
    }, [currentUser]);

    const handleDelete = async (file) => {
        try {
            await deleteFileFromStorage(file.storagePath);
            await deleteFileMetadata(file.id);
            setFiles(files.filter(f => f.id !== file.id));
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    const handleToggleStar = async (file) => {
        try {
            await toggleFileStar(file.id, file.isStarred);
            setFiles(files.map(f => f.id === file.id ? { ...f, isStarred: !f.isStarred } : f));
        } catch (error) {
            console.error("Star toggle failed", error);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: '#e0e7ff', color: '#4f46e5', borderRadius: '0.75rem' }}>
                    <FiClock size={24} />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Recent Uploads</h2>
            </div>

            {loading ? (
                <p style={{ color: 'var(--text-secondary)' }}>Loading recent files...</p>
            ) : files.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-secondary)' }}>
                    <p>No files uploaded recently.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {files.map(file => (
                        <FileItem
                            key={file.id}
                            file={file}
                            onDelete={handleDelete}
                            onToggleStar={handleToggleStar}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
