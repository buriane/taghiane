"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Receipt, Menu, X, Home } from 'lucide-react';
import { UserButton, useAuth } from '@clerk/nextjs';
import { useAuthModal } from './useAuthModal';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();
    const { isLoaded, userId } = useAuth();
    const isSignedIn = !!userId;
    const { openAuthModal } = useAuthModal();
    const [isScrolled, setIsScrolled] = useState(false);
    const [showNavbar, setShowNavbar] = useState(false);

    // Animation to show navbar after hero animations
    useEffect(() => {
        // Delay of 1.6 seconds matches the final animation in hero section (0.8s delay + 0.7s duration + little extra)
        const timer = setTimeout(() => {
            setShowNavbar(true);
        }, 1600);

        return () => clearTimeout(timer);
    }, []);

    // Check if user has scrolled to add background
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // All navigation items - Home visible to all, Split Bill requires auth
    const navItems = [
        { icon: Home, name: 'Home', path: '/' },
        { icon: Receipt, name: 'Split Bill', path: '/scan' },
    ];

    const isActive = (path: string) => {
        return pathname === path;
    };

    return (
        <div className={`fixed top-0 left-0 w-full z-50 pointer-events-none transition-all duration-700 transform ${showNavbar ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}>
            {/* Logo - Top Left */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 pointer-events-auto z-10 transition-all duration-500 delay-100">
                <Link href="/" className={`flex items-center space-x-2 p-3 rounded-xl transition-all duration-300 ${isScrolled ? 'bg-white/85 dark:bg-gray-950/85 shadow-lg backdrop-blur-md' : 'bg-transparent'
                    }`}>
                    <div className="w-8 h-8 bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-500 rounded-lg shadow-md flex items-center justify-center">
                        <Receipt className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">Taghiane</span>
                </Link>
            </div>

            {/* Navigation - Center */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-auto transition-all duration-500 delay-200">
                <nav className={`hidden md:flex items-center px-5 py-2.5 space-x-2 rounded-full transition-all duration-300 ${isScrolled ? 'bg-white/85 dark:bg-gray-950/85 shadow-lg backdrop-blur-md' : 'bg-transparent'
                    }`}>
                    {navItems.map((item) => {
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium rounded-full transition-colors ${isActive(item.path)
                                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                                    }`}
                            >
                                <item.icon className="h-4 w-4" />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Auth buttons - Top Right */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center space-x-2 pointer-events-auto z-10 transition-all duration-500 delay-300">
                {/* UserButton */}
                {isLoaded && isSignedIn && (
                    <div className={`rounded-full p-2 transition-all duration-300 flex items-center justify-center ${isScrolled ? 'bg-white/85 dark:bg-gray-950/85 shadow-lg backdrop-blur-md' : 'bg-transparent'}`}>
                        <UserButton afterSignOutUrl="/" />
                    </div>
                )}

                {/* Auth Buttons - Only visible on desktop when not signed in */}
                {isLoaded && !isSignedIn && (
                    <div className="hidden md:block">
                        <div className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-300 ${isScrolled ? 'bg-white/85 dark:bg-gray-950/85 shadow-lg backdrop-blur-md' : 'bg-transparent'
                            }`}>
                            <button
                                onClick={() => openAuthModal('signIn')}
                                className="px-4 py-1.5 text-sm rounded-full border border-blue-500 dark:border-blue-400 hover:border-blue-600 dark:hover:border-blue-300 transition-colors relative group"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => openAuthModal('signUp')}
                                className="px-4 py-1.5 text-sm rounded-full bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white relative group"
                            >
                                Register
                            </button>
                        </div>
                    </div>
                )}

                {/* Mobile menu button */}
                <div className={`md:hidden p-2.5 rounded-full transition-all duration-300 ${isScrolled ? 'bg-white/85 dark:bg-gray-950/85 shadow-lg backdrop-blur-md' : 'bg-transparent'
                    }`}>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center"
                        style={{ border: 'none', backgroundColor: 'transparent', padding: '0.5rem' }}
                    >
                        {isMenuOpen ? (
                            <X className="h-5 w-5" aria-hidden="true" />
                        ) : (
                            <Menu className="h-5 w-5" aria-hidden="true" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="absolute top-20 right-4 w-64 md:hidden pt-4 pb-4 px-4 bg-white/90 dark:bg-gray-950/90 shadow-lg rounded-xl backdrop-blur-md pointer-events-auto z-50">
                    {isLoaded && isSignedIn && (
                        <div className="md:hidden flex items-center justify-center mb-4 pb-4 border-b border-gray-100 dark:border-zinc-700">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Signed in</span>
                        </div>
                    )}
                    <div className="space-y-2">
                        {navItems.map((item) => {
                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className={`flex items-center space-x-3 px-3 py-3 text-base font-medium rounded-full ${isActive(item.path)
                                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                        : 'text-gray-600 dark:text-gray-300'
                                        }`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {isLoaded && !isSignedIn && (
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-700 flex flex-col space-y-2">
                            <button
                                onClick={() => {
                                    openAuthModal('signIn');
                                    setIsMenuOpen(false);
                                }}
                                className="w-full px-4 py-2 text-sm rounded-full border border-blue-500 dark:border-blue-400 hover:border-blue-600 dark:hover:border-blue-300 transition-colors"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => {
                                    openAuthModal('signUp');
                                    setIsMenuOpen(false);
                                }}
                                className="w-full px-4 py-2 text-sm rounded-full bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white"
                            >
                                Register
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
