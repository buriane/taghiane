"use client";

import { useEffect, useState } from 'react';
import { Receipt } from 'lucide-react';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Simulasi progress loading
        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer);
                    // Beri waktu sebentar untuk menyelesaikan animasi
                    setTimeout(() => onComplete(), 300);
                    return 100;
                }
                return prev + 5;
            });
        }, 100); // Update setiap 100ms

        return () => clearInterval(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a]">
            <div className="flex items-center space-x-2 mb-6 animate-glow">
                <div className="w-16 h-16 bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-500 rounded-2xl shadow-lg flex items-center justify-center logo-pulse">
                    <Receipt className="w-8 h-8 text-white" />
                </div>
                <span className="text-3xl font-bold bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
                    Taghiane
                </span>
            </div>

            <div className="flex flex-col items-center animate-fadeIn">
                <div className="relative h-1 w-48 bg-gray-200 dark:bg-zinc-800 rounded-full mb-4">
                    <div
                        className="h-1 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                    {progress < 30 ? "Memuat aplikasi..." :
                        progress < 60 ? "Menyiapkan data..." :
                            progress < 90 ? "Hampir selesai..." :
                                "Selamat datang!"}
                </p>
            </div>
        </div>
    );
}
