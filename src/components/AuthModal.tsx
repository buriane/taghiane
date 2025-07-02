"use client";

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { SignIn, SignUp } from '@clerk/nextjs';

type AuthModalProps = {
    isOpen: boolean;
    onClose: () => void;
    initialView: 'signIn' | 'signUp';
};

export default function AuthModal({ isOpen, onClose, initialView }: AuthModalProps) {
    const [mounted, setMounted] = useState(false);
    const [view, setView] = useState<'signIn' | 'signUp'>(initialView);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    // Update view when initialView prop changes
    useEffect(() => {
        setView(initialView);
    }, [initialView]);

    if (!mounted) return null;

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm z-50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden relative w-full max-w-md">
                    {view === 'signIn' ? (
                        <div className="relative">
                            <div className="absolute top-2 right-2 z-50">
                                <button
                                    onClick={onClose}
                                    className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                                    aria-label="Close"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <SignIn
                                appearance={{
                                    elements: {
                                        rootBox: 'w-full',
                                        card: 'shadow-none p-0 border-0 pt-8',
                                        headerTitle: 'text-2xl font-bold text-center',
                                        headerSubtitle: 'text-center',
                                        formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
                                        footerAction: 'hidden',
                                        formFieldInput: 'bg-gray-50 dark:bg-gray-800',
                                        formFieldInputShowPasswordButton: 'text-blue-600 dark:text-blue-400'
                                    }
                                }}
                                routing="hash"
                                afterSignInUrl="/"
                                afterSignUpUrl="/"
                                redirectUrl="/"
                            />
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="absolute top-2 right-2 z-50">
                                <button
                                    onClick={onClose}
                                    className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                                    aria-label="Close"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <SignUp
                                appearance={{
                                    elements: {
                                        rootBox: 'w-full',
                                        card: 'shadow-none p-0 border-0 pt-8',
                                        headerTitle: 'text-2xl font-bold text-center',
                                        headerSubtitle: 'text-center',
                                        formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
                                        footerAction: 'hidden',
                                        formFieldInput: 'bg-gray-50 dark:bg-gray-800',
                                        formFieldInputShowPasswordButton: 'text-blue-600 dark:text-blue-400'
                                    }
                                }}
                                routing="hash"
                                afterSignUpUrl="/"
                                afterSignInUrl="/"
                                redirectUrl="/"
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
