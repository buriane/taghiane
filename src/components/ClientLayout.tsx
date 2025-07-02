"use client";

import { useState, useEffect, createContext, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import ThemeProvider from './ThemeProvider';
import SplashScreen from './SplashScreen';
import AuthModal from './AuthModal';

type AuthModalContextType = {
    openAuthModal: (view: 'signIn' | 'signUp') => void;
    closeAuthModal: () => void;
};

// Create a context for the auth modal
export const AuthModalContext = createContext<AuthModalContextType>({
    openAuthModal: () => { },
    closeAuthModal: () => { }
});

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalView, setAuthModalView] = useState<'signIn' | 'signUp'>('signIn');

    // In a real app, you might want to only show splash screen on first load
    // This could be managed with localStorage or similar
    useEffect(() => {
        // Check if this is the first visit in this session
        const hasVisited = sessionStorage.getItem('hasVisitedTaghiane');

        if (hasVisited) {
            setLoading(false);
        } else {
            // If first visit, we'll show the splash screen
            // You could remove this setTimeout and just use the splash screen's built-in timer
            setTimeout(() => {
                sessionStorage.setItem('hasVisitedTaghiane', 'true');
            }, 100);
        }
    }, []);

    const openAuthModal = useCallback((view: 'signIn' | 'signUp') => {
        setAuthModalView(view);
        setIsAuthModalOpen(true);
    }, []);

    const closeAuthModal = useCallback(() => {
        setIsAuthModalOpen(false);
    }, []);

    const handleSplashComplete = () => {
        setLoading(false);
    };

    // Handle protected route redirects from middleware
    useEffect(() => {
        // Check if the URL includes a special parameter indicating we need to show login
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('auth')) {
            // Small delay to ensure components are loaded
            const timer = setTimeout(() => {
                openAuthModal('signIn');
                // Clean up the URL by removing the parameter
                const cleanUrl = window.location.pathname;
                window.history.replaceState({}, document.title, cleanUrl);
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [openAuthModal]);

    const authModalContextValue = {
        openAuthModal,
        closeAuthModal
    };

    return (
        <ThemeProvider>
            <AuthModalContext.Provider value={authModalContextValue}>
                {loading ? (
                    <SplashScreen onComplete={handleSplashComplete} />
                ) : (
                    <>
                        <Navbar />
                        {children}
                        <AuthModal
                            isOpen={isAuthModalOpen}
                            onClose={closeAuthModal}
                            initialView={authModalView}
                        />
                    </>
                )}
            </AuthModalContext.Provider>
        </ThemeProvider>
    );
}
