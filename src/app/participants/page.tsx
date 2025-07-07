"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useAuthModal } from "@/components/useAuthModal";
import SplashScreen from "@/components/SplashScreen";
import { Plus, Trash2, ChevronRight, Users } from "lucide-react";

// Type definitions
type Participant = {
    id: string;
    name: string;
};

type ReceiptData = {
    items: Array<{
        id: string;
        name: string;
        price: number;
    }>;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    rawText: string;
    imageUrl: string;
    participants?: Participant[];
};

export default function ParticipantsPage() {
    const { isLoaded, userId } = useAuth();
    const { openAuthModal } = useAuthModal();
    const [, setLoadingComplete] = useState(false);
    const [receipt, setReceipt] = useState<ReceiptData | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [newParticipantName, setNewParticipantName] = useState("");
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && !userId) {
            openAuthModal('signIn');
            return;
        }

        // Load receipt data from session storage
        const savedReceiptData = sessionStorage.getItem('receiptData');
        if (savedReceiptData) {
            try {
                const parsedData = JSON.parse(savedReceiptData) as ReceiptData;
                setReceipt(parsedData);

                // Initialize participants array
                if (parsedData.participants && parsedData.participants.length > 0) {
                    setParticipants(parsedData.participants);
                }

            } catch (error) {
                console.error("Error parsing receipt data:", error);
                // Redirect back to scan page if data is invalid
                router.push('/scan');
            }
        } else {
            // No data found, redirect back to scan page
            router.push('/scan');
        }
    }, [isLoaded, userId, openAuthModal, router]);

    const handleAddParticipant = () => {
        if (!newParticipantName.trim()) return;

        const newParticipant: Participant = {
            id: Math.random().toString(36).substring(2, 9),
            name: newParticipantName.trim()
        };

        setParticipants([...participants, newParticipant]);
        setNewParticipantName("");
    };

    const handleDeleteParticipant = (id: string) => {
        setParticipants(participants.filter(p => p.id !== id));
    };

    const handleContinue = () => {
        if (!receipt) return;

        // Update receipt data with participants
        const updatedReceipt = {
            ...receipt,
            participants: participants
        };

        // Save updated receipt data to session storage
        sessionStorage.setItem('receiptData', JSON.stringify(updatedReceipt));

        // Navigate to the next page (assign items)
        router.push('/assign');
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
            <h1 className="text-3xl font-bold mb-6">Tambahkan Peserta</h1>

            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6 mb-8">
                <div className="mb-6">
                    <p className="mb-4 text-gray-700 dark:text-gray-300">
                        Masukkan nama teman-teman yang ikut dalam pembagian tagihan ini
                    </p>

                    {/* Add participant form */}
                    <div className="flex space-x-2 mb-6">
                        <input
                            type="text"
                            value={newParticipantName}
                            onChange={(e) => setNewParticipantName(e.target.value)}
                            placeholder="Nama peserta"
                            className="px-3 py-2 border dark:border-zinc-600 dark:bg-zinc-700 dark:text-white border-gray-300 rounded-lg flex-grow"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddParticipant();
                                }
                            }}
                        />
                        <button
                            onClick={handleAddParticipant}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-1"
                        >
                            <Plus size={18} />
                            Tambah
                        </button>
                    </div>

                    {/* Participant list */}
                    {participants.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed dark:border-zinc-700 border-gray-200 rounded-lg">
                            <div className="flex justify-center mb-3">
                                <Users size={40} className="text-gray-400 dark:text-gray-500" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400">
                                Belum ada peserta yang ditambahkan
                            </p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                Tambahkan minimal 2 peserta untuk melanjutkan
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {participants.map((participant) => (
                                <div
                                    key={participant.id}
                                    className="flex justify-between items-center border dark:border-zinc-700 border-gray-200 rounded-lg p-4"
                                >
                                    <span className="font-medium dark:text-white">{participant.name}</span>
                                    <button
                                        onClick={() => handleDeleteParticipant(participant.id)}
                                        className="text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Self as participant note */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                        <span className="font-semibold">Catatan:</span> Anda sebagai pengguna akan otomatis ditambahkan sebagai peserta.
                    </p>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <Link
                    href="/scan/result"
                    className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                >
                    &larr; Kembali ke Hasil Scan
                </Link>

                <button
                    onClick={handleContinue}
                    disabled={participants.length < 1}
                    className={`font-medium py-2.5 px-5 rounded-lg transition-colors flex items-center gap-2
                        ${participants.length < 1
                            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                >
                    Lanjut
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}
