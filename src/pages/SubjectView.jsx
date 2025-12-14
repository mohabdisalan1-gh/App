import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { subscribeToFiles, addFileMetadata, deleteFileMetadata, toggleFileStar } from '../services/firestore';
import { uploadFile, deleteFileFromStorage } from '../services/storage';
import FileItem from '../components/Dashboard/FileItem';
import Modal from '../components/Modal';
import { FiUploadCloud, FiFilter } from 'react-icons/fi';
import '../index.css';

export default function SubjectView() {
    const { id } = useParams();
    const { state } = useLocation();
    const { currentUser } = useAuth();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploadingFiles, setUploadingFiles] = useState({}); // { fileName: progress }
    const [dragActive, setDragActive] = useState(false);
    const subjectName = state?.subjectName || 'Subject Files';

    // Unified Delete Modal State
    // { type: 'single', file: fileObject } OR { type: 'batch' }
    const [deleteAction, setDeleteAction] = useState(null);

    // Batch Selection State
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());

    useEffect(() => {
        if (currentUser && id) {
            const unsubscribe = subscribeToFiles(currentUser.uid, id, (data) => {
                setFiles(data);
                setLoading(false);
            });
            return () => unsubscribe();
        }
    }, [currentUser, id]);

    // Handlers
    const handleDeleteClick = (file) => {
        setDeleteAction({ type: 'single', file });
    };

    const confirmDelete = async () => {
        if (!deleteAction) return;

        if (deleteAction.type === 'single') {
            await handleDelete(deleteAction.file);
        } else if (deleteAction.type === 'batch') {
            // Processing Batch Delete
            for (const fileId of selectedIds) {
                const file = files.find(f => f.id === fileId);
                if (file) {
                    await handleDelete(file);
                }
            }
            setSelectedIds(new Set());
            setIsSelectionMode(false);
        }

        setDeleteAction(null);
    };

    // ... Toggle Selection Logic ...
    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedIds(new Set());
    };

    const handleToggleFileSelection = (fileId) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(fileId)) {
                newSet.delete(fileId);
            } else {
                newSet.add(fileId);
            }
            return newSet;
        });
    };

    const openBatchDeleteModal = () => {
        if (selectedIds.size === 0) return;
        setDeleteAction({ type: 'batch' });
    };

    // ... Drag/Drop handlers ...
    const handleDrag = function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };
    // ... [Rest of Drag Drop methods] ...
    const handleDrop = function (e) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleChange = function (e) {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };

    // ... File Upload Logic ...
    const handleFiles = async (fileList) => {
        const filesToUpload = Array.from(fileList).filter(file => file.type === 'application/pdf');

        if (filesToUpload.length === 0) {
            alert("Only PDF files are allowed.");
            return;
        }

        filesToUpload.forEach(async (file) => {
            setUploadingFiles(prev => ({ ...prev, [file.name]: 0 }));

            try {
                // Cloudinary upload
                // We don't necessarily need a path for Cloudinary 'upload_preset', but keeping the variable doesn't hurt.
                // const path = ... ; 

                const metadata = await uploadFile(file, null, (progress) => {
                    setUploadingFiles(prev => ({ ...prev, [file.name]: progress }));
                });

                // Add to Firestore - Listener will update UI automatically
                await addFileMetadata(currentUser.uid, id, {
                    name: file.name, // Use original name to avoid confusion
                    url: metadata.url,
                    size: metadata.size,
                    type: file.type, // Maintain 'application/pdf' mime type
                    storagePath: metadata.path // This is the Cloudinary public_id
                });

            } catch (error) {
                console.error("Upload failed", error);
                alert(`Failed to upload ${file.name}`);
            } finally {
                setUploadingFiles(prev => {
                    const newState = { ...prev };
                    delete newState[file.name];
                    return newState;
                });
            }
        });
    };

    // ... Delete Logic ...
    const handleDelete = async (file) => {
        try {
            if (file.storagePath) {
                await deleteFileFromStorage(file.storagePath);
            }
            await deleteFileMetadata(file.id);
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    // ... Star logic ...
    const handleToggleStar = async (file) => {
        try {
            await toggleFileStar(file.id, file.isStarred);
        } catch (error) {
            console.error("Star toggle failed", error);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{subjectName}</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {!isSelectionMode ? (
                        <>
                            <button
                                onClick={toggleSelectionMode}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                                    border: '1px solid var(--border-light)',
                                    backgroundColor: 'var(--bg-surface)',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer'
                                }}>
                                Select Files
                            </button>
                            <button style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                                border: '1px solid var(--border-light)',
                                backgroundColor: 'var(--bg-surface)',
                                color: 'var(--text-secondary)'
                            }}>
                                <FiFilter /> Sort
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={openBatchDeleteModal}
                                disabled={selectedIds.size === 0}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                                    border: 'none',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    cursor: selectedIds.size > 0 ? 'pointer' : 'not-allowed',
                                    opacity: selectedIds.size > 0 ? 1 : 0.5
                                }}>
                                Delete ({selectedIds.size})
                            </button>
                            <button
                                onClick={toggleSelectionMode}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                                    border: '1px solid var(--border-light)',
                                    backgroundColor: 'var(--bg-surface)',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer'
                                }}>
                                Cancel
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Upload Area */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                style={{
                    border: '2px dashed',
                    borderColor: dragActive ? 'var(--color-primary)' : 'var(--border-light)',
                    backgroundColor: dragActive ? 'rgba(79, 70, 229, 0.05)' : 'var(--bg-surface)',
                    padding: '2rem',
                    borderRadius: '1rem',
                    textAlign: 'center',
                    fontSize: '1rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '2rem',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    position: 'relative'
                }}
                onClick={() => document.getElementById('file-upload').click()}
            >
                <input
                    type="file"
                    id="file-upload"
                    multiple
                    accept="application/pdf"
                    onChange={handleChange}
                    style={{ display: 'none' }}
                />
                <FiUploadCloud size={32} style={{ marginBottom: '0.5rem', color: dragActive ? 'var(--color-primary)' : 'var(--text-secondary)' }} />
                <p>Drag & drop PDFs here, or click to browse</p>
            </div>

            {/* File List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Uploading... */}
                {Object.entries(uploadingFiles).map(([fileName, progress]) => (
                    <div key={`uploading-${fileName}`} style={{
                        backgroundColor: 'var(--bg-surface)',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--border-light)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        opacity: 0.7
                    }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                <span style={{ fontWeight: '500', fontSize: '0.95rem' }}>{fileName}</span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{Math.round(progress)}%</span>
                            </div>
                            <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--bg-body)', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ width: `${progress}%`, height: '100%', backgroundColor: 'var(--color-primary)', transition: 'width 0.2s ease' }} />
                            </div>
                        </div>
                    </div>
                ))}

                {/* Real Files */}
                {loading && files.length === 0 && Object.keys(uploadingFiles).length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading files...</p>
                ) : files.length === 0 && Object.keys(uploadingFiles).length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>No PDFs uploaded yet.</p>
                ) : (
                    files.map(file => (
                        <FileItem
                            key={file.id}
                            file={file}
                            onDelete={handleDeleteClick}
                            onToggleStar={handleToggleStar}
                            isSelectionMode={isSelectionMode}
                            isSelected={selectedIds.has(file.id)}
                            onSelect={() => handleToggleFileSelection(file.id)}
                        />
                    ))
                )}
            </div>

            {/* UNIFIED DELETE MODAL */}
            <Modal
                isOpen={!!deleteAction}
                onClose={() => setDeleteAction(null)}
                title={deleteAction?.type === 'batch' ? "Delete Multiple Files" : "Delete File"}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {deleteAction?.type === 'batch'
                            ? `Are you sure you want to delete ${selectedIds.size} files? This action cannot be undone.`
                            : <span>Are you sure you want to delete <strong>{deleteAction?.file?.name}</strong>? This action cannot be undone.</span>
                        }
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button
                            onClick={() => setDeleteAction(null)}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '0.5rem',
                                border: '1px solid var(--border-light)',
                                backgroundColor: 'transparent',
                                color: 'var(--text-primary)',
                                fontWeight: '500',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDelete}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '0.5rem',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                fontWeight: '500',
                                cursor: 'pointer',
                                border: 'none'
                            }}
                        >
                            {deleteAction?.type === 'batch' ? `Delete ${selectedIds.size} Files` : 'Delete File'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div >
    );
}
