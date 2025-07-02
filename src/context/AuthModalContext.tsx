"use client";

import React, { createContext, useContext, useState } from 'react';

type ModalView = 'signin' | 'signup' | null;

interface AuthModalContextProps {
    view: ModalView;
    isOpen: boolean;
    openModal: (view: 'signin' | 'signup') => void;
    closeModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextProps | undefined>(undefined);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<ModalView>(null);

    const openModal = (view: 'signin' | 'signup') => {
        setView(view);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        // Reset view after animation completes
        setTimeout(() => setView(null), 300);
    };

    return (
        <AuthModalContext.Provider value={{ view, isOpen, openModal, closeModal }}>
            {children}
        </AuthModalContext.Provider>
    );
}

export const useAuthModal = () => {
    const context = useContext(AuthModalContext);
    if (context === undefined) {
        throw new Error('useAuthModal must be used within an AuthModalProvider');
    }
    return context;
};
