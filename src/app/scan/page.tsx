"use client";

import Link from "next/link";
import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ScanPage() {
    const { isLoaded, userId } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && !userId) {
            router.push('/?auth=required');
        }
    }, [isLoaded, userId, router]);

    // Show loading while auth is being checked
    if (!isLoaded) {
        return (
            <div className="container mx-auto px-4 py-10 max-w-4xl pt-28 mt-4">
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg">Loading...</div>
                </div>
            </div>
        );
    }

    // Show nothing if not authenticated (will redirect)
    if (!userId) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-10 max-w-4xl pt-28 mt-4">
            <h1 className="text-3xl font-bold mb-6">Unggah Foto Nota</h1>

            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6 mb-8">
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Unggah foto nota atau struk Anda untuk mulai membagi tagihan
                </p>

                <div className="flex flex-col space-y-4">
                    <label
                        htmlFor="receipt-upload"
                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                    >
                        <div className="flex flex-col items-center justify-center">
                            <svg
                                className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                            </svg>
                            <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
                                <span className="font-semibold">Klik untuk unggah</span> atau seret dan lepas
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                PNG, JPG atau JPEG (maks. 10MB)
                            </p>
                        </div>
                        <input
                            id="receipt-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    // Handle file upload
                                    console.log("File selected:", file);
                                    // Anda bisa menambahkan logika upload di sini
                                }
                            }}
                        />
                    </label>

                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">atau</p>
                        <button
                            onClick={() => {
                                // Trigger camera if available
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*';
                                input.capture = 'camera';
                                input.onchange = (e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0];
                                    if (file) {
                                        // Handle camera photo
                                        console.log("Photo taken:", file);
                                        // Anda bisa menambahkan logika upload di sini
                                    }
                                };
                                input.click();
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            Ambil Foto dari Kamera
                        </button>
                    </div>
                </div>
            </div>

            <div className="text-center">
                <Link
                    href="/"
                    className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                >
                    &larr; Kembali ke Beranda
                </Link>
            </div>
        </div>
    );
}