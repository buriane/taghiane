"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useAuthModal } from "@/components/useAuthModal";
import SplashScreen from "@/components/SplashScreen";
import { createWorker } from 'tesseract.js';
import { useRouter } from 'next/navigation';
import { MoonLoader } from 'react-spinners';

// Type for OCR results
type ReceiptData = {
    items: Array<{
        name: string;
        price: number;
    }>;
    subtotal?: number;
    tax?: number;
    discount?: number;
    total?: number;
    rawText: string;
    imageUrl: string;
};

export default function ScanPage() {
    const { isLoaded, userId } = useAuth();
    const { openAuthModal } = useAuthModal();
    const [, setLoadingComplete] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && !userId) {
            openAuthModal('signIn');
        }
    }, [isLoaded, userId, openAuthModal]);

    const processReceiptImage = async (file: File) => {
        setIsProcessing(true);

        try {
            // Convert file to base64 for display
            const reader = new FileReader();
            reader.onload = (e) => {
                setUploadedImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);

            // Initialize Tesseract worker
            const worker = await createWorker('ind');

            // Recognize text from image
            const { data } = await worker.recognize(file);
            console.log('OCR Result:', data);

            // Basic parsing of receipt data (simplified for now)
            const receiptData: ReceiptData = {
                items: [],
                rawText: data.text,
                imageUrl: URL.createObjectURL(file)
            };

            // Simple parsing logic (will be enhanced later)
            const lines = data.text.split('\n').filter(line => line.trim() !== '');

            // Simple extraction of total (just as an example)
            const totalLine = lines.find(line =>
                /total|amount|sum/i.test(line) && /\d+[.,]\d+/.test(line)
            );

            if (totalLine) {
                const totalMatch = totalLine.match(/\d+[.,]\d+/);
                if (totalMatch) {
                    receiptData.total = parseFloat(totalMatch[0].replace(',', '.'));
                }
            }

            // Attempt to extract items (very basic approach)
            for (const line of lines) {
                // Look for lines that have numbers that could be prices
                const priceMatch = line.match(/\d+[.,]\d+$/);
                if (priceMatch) {
                    const price = parseFloat(priceMatch[0].replace(',', '.'));
                    const name = line.replace(priceMatch[0], '').trim();

                    // Only add if name seems valid (not just numbers or very short)
                    if (name.length > 2 && !/^\d+$/.test(name)) {
                        receiptData.items.push({
                            name,
                            price
                        });
                    }
                }
            }

            // Store receipt data in session storage for the next page
            sessionStorage.setItem('receiptData', JSON.stringify(receiptData));

            // Terminate worker
            await worker.terminate();

            // Navigate to result page after processing
            setTimeout(() => {
                router.push('/scan/result');
            }, 1000);

        } catch (error) {
            console.error('Error processing image:', error);
            alert('Error processing the receipt. Please try again.');
            setIsProcessing(false);
        }
    };

    const handleFileUpload = (file: File) => {
        if (file) {
            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert('File size exceeds 10MB. Please choose a smaller file.');
                return;
            }

            // Check file type
            if (!file.type.startsWith('image/')) {
                alert('Please upload a valid image file (PNG, JPG or JPEG).');
                return;
            }

            processReceiptImage(file);
        }
    };

    if (!isLoaded) {
        return <SplashScreen onComplete={() => setLoadingComplete(true)} />;
    }

    if (!userId) {
        return (
            <div className="container mx-auto px-4 py-10 max-w-4xl pt-28 mt-4 text-center">
                <h1 className="text-2xl font-bold mb-4">Silakan masuk untuk melanjutkan</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Anda harus masuk untuk menggunakan fitur ini
                </p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-10 max-w-4xl pt-28 mt-4">
            <h1 className="text-3xl font-bold mb-6">Unggah Foto Nota</h1>

            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6 mb-8">
                {isProcessing ? (
                    <div className="flex flex-col items-center justify-center p-6">
                        <MoonLoader
                            color="#3B82F6"
                            size={50}
                            aria-label="Loading Spinner"
                        />
                        <p className="mt-4 text-gray-700 dark:text-gray-300">
                            Sedang memproses gambar...
                        </p>
                        {uploadedImage && (
                            <div className="mt-6 max-w-xs mx-auto">
                                <div
                                    className="max-h-60 h-60 w-full rounded-lg mx-auto shadow-md relative"
                                >
                                    {/* Using style-based image as a workaround for dynamic base64 images */}
                                    <div
                                        className="w-full h-full bg-center bg-contain bg-no-repeat rounded-lg"
                                        style={{ backgroundImage: `url(${uploadedImage})` }}
                                        aria-label="Uploaded receipt"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
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
                                            handleFileUpload(file);
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
                                                handleFileUpload(file);
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
                    </>
                )}
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