import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeToAllUserFiles, deleteFileMetadata, toggleFileStar } from '../services/firestore';
import FileItem from '../components/Dashboard/FileItem';
import { useSearchParams } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import { deleteFileFromStorage } from '../services/storage';

export default function SearchResults() {
    const { currentUser } = useAuth();
    const [searchParams] = useSearchParams();
    const queryTerm = searchParams.get('q') || '';
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser && queryTerm) {
            setLoading(true);
            const unsubscribe = subscribeToAllUserFiles(currentUser.uid, (data) => {
                const allFiles = data || [];
                // Sort by createdAt desc
                allFiles.sort((a, b) => {
                    const dateA = new Date(a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (a.createdAt || 0));
                    const dateB = new Date(b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (b.createdAt || 0));
                    return dateB - dateA;
                });

                const filtered = allFiles.filter(file =>
                    file.name.toLowerCase().includes(queryTerm.toLowerCase())
                );

                setFiles(filtered);
                setLoading(false);
            });
            return () => unsubscribe();
        } else {
            setLoading(false);
        }
    }, [currentUser, queryTerm]);

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
                <div style={{ padding: '0.75rem', backgroundColor: '#f3f4f6', color: '#4b5563', borderRadius: '0.75rem' }}>
                    <FiSearch size={24} />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Search Results</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Showing results for "{queryTerm}"</p>
                </div>
            </div>

            {loading ? (
                <p style={{ color: 'var(--text-secondary)' }}>Searching...</p>
            ) : files.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-secondary)' }}>
                    <p>No files found matching "{queryTerm}".</p>
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
