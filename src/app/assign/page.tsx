"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useAuthModal } from "@/components/useAuthModal";
import SplashScreen from "@/components/SplashScreen";
import { ChevronRight, Receipt, DollarSign } from "lucide-react";

// Type definitions
type Participant = {
    id: string;
    name: string;
};

type ReceiptItem = {
    id: string;
    name: string;
    price: number;
    assignedTo?: string[];  // Array of participant IDs
    splitEvenly?: boolean;  // Whether item is split evenly among all participants
};

type ReceiptData = {
    items: ReceiptItem[];
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    rawText: string;
    imageUrl: string;
    participants?: Participant[];
    currentUserId?: string;
};

export default function AssignItemsPage() {
    const { isLoaded, userId } = useAuth();
    const { openAuthModal } = useAuthModal();
    const [, setLoadingComplete] = useState(false);
    const [receipt, setReceipt] = useState<ReceiptData | null>(null);
    const [items, setItems] = useState<ReceiptItem[]>([]);
    const [participants, setParticipants] = useState<Participant[]>([]);
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

                // Check if participants exist, otherwise redirect
                if (!parsedData.participants || parsedData.participants.length === 0) {
                    router.push('/participants');
                    return;
                }

                // Add current user to participants if not already included
                const currentUserName = "You"; // This would typically come from Clerk user profile
                const currentUserExists = parsedData.participants.some(p => p.id === userId);

                let allParticipants = [...parsedData.participants];
                if (!currentUserExists && userId) {
                    allParticipants = [
                        { id: userId, name: currentUserName },
                        ...allParticipants
                    ];
                }

                setParticipants(allParticipants);

                // Initialize items with assignment data if not already present
                const itemsWithAssignments = parsedData.items.map(item => ({
                    ...item,
                    assignedTo: item.assignedTo || [],
                    splitEvenly: item.splitEvenly || false
                }));

                setItems(itemsWithAssignments);
                setReceipt({
                    ...parsedData,
                    participants: allParticipants,
                    items: itemsWithAssignments,
                    currentUserId: userId || undefined
                });

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

    const handleToggleAssignment = (itemId: string, participantId: string) => {
        setItems(prevItems =>
            prevItems.map(item => {
                if (item.id === itemId) {
                    // Check if participant is already assigned
                    const isAssigned = item.assignedTo?.includes(participantId);

                    if (isAssigned) {
                        // Remove participant
                        return {
                            ...item,
                            assignedTo: item.assignedTo?.filter(id => id !== participantId),
                            splitEvenly: false
                        };
                    } else {
                        // Add participant
                        return {
                            ...item,
                            assignedTo: [...(item.assignedTo || []), participantId],
                            splitEvenly: false
                        };
                    }
                }
                return item;
            })
        );
    };

    const handleToggleSplitEvenly = (itemId: string) => {
        setItems(prevItems =>
            prevItems.map(item => {
                if (item.id === itemId) {
                    if (item.splitEvenly) {
                        // Turn off split evenly
                        return {
                            ...item,
                            splitEvenly: false,
                            assignedTo: []
                        };
                    } else {
                        // Turn on split evenly, assign to all participants
                        return {
                            ...item,
                            splitEvenly: true,
                            assignedTo: participants.map(p => p.id)
                        };
                    }
                }
                return item;
            })
        );
    };

    const handleContinue = () => {
        if (!receipt) return;

        // Check if all items are assigned to at least one participant
        const unassignedItems = items.filter(item =>
            (!item.assignedTo || item.assignedTo.length === 0) && !item.splitEvenly
        );

        if (unassignedItems.length > 0) {
            alert(`Masih ada ${unassignedItems.length} item yang belum ditugaskan kepada peserta.`);
            return;
        }

        // Update receipt data with assigned items
        const updatedReceipt = {
            ...receipt,
            items: items,
            currentUserId: userId
        };

        // Save updated receipt data to session storage
        sessionStorage.setItem('receiptData', JSON.stringify(updatedReceipt));

        // Navigate to the summary page
        router.push('/summary');
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

    if (!receipt || participants.length === 0) {
        return (
            <div className="container mx-auto px-4 py-10 max-w-4xl pt-28 mt-4 text-center">
                <h1 className="text-2xl font-bold mb-4">Memuat data...</h1>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-10 max-w-4xl pt-28 mt-4">
            <h1 className="text-3xl font-bold mb-6">Tugaskan Item</h1>

            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6 mb-8">
                <p className="mb-6 text-gray-700 dark:text-gray-300">
                    Tentukan siapa yang memesan setiap item di nota ini
                </p>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 dark:bg-zinc-700/40 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">Dipilih</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">Tidak dipilih</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">Dibagi rata</span>
                    </div>
                </div>

                {/* Items List */}
                <div className="space-y-6">
                    {items.map(item => (
                        <div key={item.id} className="border dark:border-zinc-700 border-gray-200 rounded-lg overflow-hidden">
                            {/* Item Header */}
                            <div className="bg-gray-50 dark:bg-zinc-700/40 p-4 flex justify-between items-center">
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white">{item.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Rp {item.price.toLocaleString('id-ID')}
                                    </p>
                                </div>

                                <button
                                    onClick={() => handleToggleSplitEvenly(item.id)}
                                    className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5
                                        ${item.splitEvenly
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                            : 'bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300'}`}
                                >
                                    <DollarSign size={14} />
                                    {item.splitEvenly ? 'Dibagi rata' : 'Bagi rata?'}
                                </button>
                            </div>

                            {/* Participant Selection */}
                            <div className="p-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                    {item.splitEvenly
                                        ? 'Item ini dibagi rata ke semua peserta'
                                        : 'Pilih siapa yang memesan item ini:'}
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    {participants.map(participant => {
                                        const isAssigned = item.assignedTo?.includes(participant.id);
                                        return (
                                            <button
                                                key={participant.id}
                                                onClick={() => !item.splitEvenly && handleToggleAssignment(item.id, participant.id)}
                                                disabled={item.splitEvenly}
                                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                                                    ${item.splitEvenly
                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                                        : isAssigned
                                                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                                                            : 'bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-600'}`}
                                            >
                                                {participant.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Statistics */}
                <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                        <Receipt size={18} />
                        Ringkasan Tagihan
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                        Total: <span className="font-semibold">Rp {receipt.total.toLocaleString('id-ID')}</span> •
                        Item: <span className="font-semibold">{items.length}</span> •
                        Peserta: <span className="font-semibold">{participants.length}</span>
                    </p>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <Link
                    href="/participants"
                    className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                >
                    &larr; Kembali ke Peserta
                </Link>

                <button
                    onClick={handleContinue}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-5 rounded-lg transition-colors flex items-center gap-2"
                >
                    Hitung & Ringkas
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}
