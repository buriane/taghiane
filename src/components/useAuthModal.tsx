"use client";

import { useContext } from 'react';
import { AuthModalContext } from './ClientLayout';

export function useAuthModal() {
    const context = useContext(AuthModalContext);

    if (context === undefined) {
        throw new Error('useAuthModal must be used within an AuthModalProvider');
    }

    return context;
}
