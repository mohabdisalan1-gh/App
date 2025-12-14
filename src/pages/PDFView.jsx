import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { FiChevronLeft, FiMinus, FiPlus, FiArrowLeft, FiArrowRight, FiMaximize, FiMinimize } from 'react-icons/fi';

import '../index.css';

// Set worker source for react-pdf
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function PDFView() {
    const { id } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();
    const file = state?.file;

    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [width, setWidth] = useState(window.innerWidth > 800 ? 800 : window.innerWidth - 40);
    const [pdfUrl, setPdfUrl] = useState(null); // Local blob URL

    const [isFullScreen, setIsFullScreen] = useState(false);
    const containerRef = React.useRef(null);

    // Simplified URL logic for Cloudinary
    useEffect(() => {
        if (file?.url) {
            setPdfUrl(file.url);
        }
    }, [file]);

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
            setIsFullScreen(true);
        } else {
            document.exitFullscreen();
            setIsFullScreen(false);
        }
    };

    useEffect(() => {
        // Resize listener
        function handleResize() {
            setWidth(window.innerWidth > 800 ? 800 : window.innerWidth - 40);
        }
        window.addEventListener('resize', handleResize);

        // Fullscreen listener
        function onFullscreenChange() {
            setIsFullScreen(!!document.fullscreenElement);
        }
        document.addEventListener('fullscreenchange', onFullscreenChange);

        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('fullscreenchange', onFullscreenChange);
        };
    }, []);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }

    if (!file) {
        return (
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                <p>No file selected.</p>
                <button onClick={() => navigate(-1)} style={{ color: 'var(--color-primary)', marginTop: '1rem' }}>Go Back</button>
            </div>
        );
    }

    return (
        <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', height: isFullScreen ? '100vh' : 'calc(100vh - 100px)', backgroundColor: isFullScreen ? '#525659' : 'transparent' }}>
            {/* Viewer Header / Toolbar */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: isFullScreen ? '0' : '1rem',
                padding: '0.5rem',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: isFullScreen ? '0' : '0.5rem',
                border: isFullScreen ? 'none' : '1px solid var(--border-light)',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => isFullScreen ? toggleFullScreen() : navigate(-1)} style={{ background: 'none', color: 'var(--text-main)' }}>
                        <FiChevronLeft size={24} />
                    </button>
                    <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{file.name}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-body)', padding: '0.25rem', borderRadius: '0.5rem' }}>
                        <button
                            onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
                            style={{ padding: '0.25rem', background: 'none', color: 'var(--text-main)' }}
                        >
                            <FiMinus />
                        </button>
                        <span style={{ fontSize: '0.9rem', width: '3rem', textAlign: 'center' }}>{Math.round(scale * 100)}%</span>
                        <button
                            onClick={() => setScale(s => Math.min(2.0, s + 0.1))}
                            style={{ padding: '0.25rem', background: 'none', color: 'var(--text-main)' }}
                        >
                            <FiPlus />
                        </button>
                    </div>
                    <button onClick={toggleFullScreen} title={isFullScreen ? "Exit Full Screen" : "Full Screen"} style={{ background: 'none', color: 'var(--text-main)' }}>
                        {isFullScreen ? <FiMinimize size={20} /> : <FiMaximize size={20} />}
                    </button>
                </div>
            </div>

            {/* PDF Container */}
            <div style={{
                flex: 1,
                overflow: 'auto',
                backgroundColor: '#525659', // Standard PDF viewer background
                borderRadius: '0.5rem',
                display: 'flex',
                justifyContent: 'center',
                padding: '2rem',
                position: 'relative'
            }}>
                <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={(error) => console.error("PDF Load Error:", error)}
                    loading={<div style={{ color: '#fff' }}>Loading PDF...</div>}
                    error={<div style={{ color: '#ef4444' }}>Failed to load PDF.</div>}
                >
                    <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        width={width}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                    />
                </Document>

                {/* Floating Page Controls */}
                {numPages && (
                    <div style={{
                        position: 'absolute',
                        bottom: '2rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        padding: '0.5rem 1rem',
                        borderRadius: '2rem',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}>
                        <button
                            disabled={pageNumber <= 1}
                            onClick={() => setPageNumber(p => p - 1)}
                            style={{ background: 'none', color: '#fff', opacity: pageNumber <= 1 ? 0.5 : 1 }}
                        >
                            <FiArrowLeft />
                        </button>
                        <span>{pageNumber} / {numPages}</span>
                        <button
                            disabled={pageNumber >= numPages}
                            onClick={() => setPageNumber(p => p + 1)}
                            style={{ background: 'none', color: '#fff', opacity: pageNumber >= numPages ? 0.5 : 1 }}
                        >
                            <FiArrowRight />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
