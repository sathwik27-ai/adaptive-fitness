import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
    const overlayRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose?.(); };
        if (isOpen) window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog" aria-modal="true" aria-labelledby="modal-title"
            onClick={(e) => { if (e.target === overlayRef.current) onClose?.(); }}
        >
            <div className="absolute inset-0 bg-cta/40 backdrop-blur-sm" />
            <div className="relative bg-bg-card rounded-modal shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-bg-surface">
                    <h2 id="modal-title" className="text-lg font-semibold text-text-primary">{title}</h2>
                    <button onClick={onClose} aria-label="Close modal" className="p-2 hover:bg-bg-secondary rounded-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                        <X size={18} />
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}
