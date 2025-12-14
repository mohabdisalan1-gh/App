import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeToAllUserFiles, deleteFileMetadata, toggleFileStar } from '../services/firestore';
import { deleteFileFromStorage } from '../services/storage';
import FileItem from '../components/Dashboard/FileItem';
import { FiStar } from 'react-icons/fi';

export default function Favorites() {
    const { currentUser } = useAuth();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            const unsubscribe = subscribeToAllUserFiles(currentUser.uid, (data) => {
                const favorites = (data || []).filter(f => f.isStarred);
                // Sort by createdAt desc
                favorites.sort((a, b) => {
                    const dateA = new Date(a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (a.createdAt || 0));
                    const dateB = new Date(b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (b.createdAt || 0));
                    return dateB - dateA;
                });
                setFiles(favorites);
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
            // Remove from favorites list if unstarred
            setFiles(files.filter(f => f.id !== file.id));
        } catch (error) {
            console.error("Star toggle failed", error);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: '#fff7ed', color: '#ea580c', borderRadius: '0.75rem' }}>
                    <FiStar size={24} />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Favorites</h2>
            </div>

            {loading ? (
                <p style={{ color: 'var(--text-secondary)' }}>Loading favorites...</p>
            ) : files.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-secondary)' }}>
                    <p>No favorite files yet.</p>
                    <p style={{ fontSize: '0.9rem' }}>Star important files to see them here.</p>
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
