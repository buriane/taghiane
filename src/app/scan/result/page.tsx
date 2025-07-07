"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useAuthModal } from "@/components/useAuthModal";
import SplashScreen from "@/components/SplashScreen";
import { Edit, Plus, Trash2, ChevronRight } from "lucide-react";

// Type definitions
type ReceiptItem = {
    name: string;
    price: number;
    id: string;  // unique ID for each item
};

type ReceiptData = {
    items: ReceiptItem[];
    subtotal?: number;
    tax?: number;
    discount?: number;
    total?: number;
    rawText: string;
    imageUrl: string;
};

export default function ScanResultPage() {
    const { isLoaded, userId } = useAuth();
    const { openAuthModal } = useAuthModal();
    const [, setLoadingComplete] = useState(false);
    const [receipt, setReceipt] = useState<ReceiptData | null>(null);
    const [isEditing, setIsEditing] = useState<string | null>(null);  // ID of item being edited
    const [editName, setEditName] = useState("");
    const [editPrice, setEditPrice] = useState("");
    const [calculatedSubtotal, setCalculatedSubtotal] = useState(0);
    const [calculatedTotal, setCalculatedTotal] = useState(0);
    const [tax, setTax] = useState<string>("0");
    const [discount, setDiscount] = useState<string>("0");
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

                // Add unique IDs to items if they don't exist
                const itemsWithIds = parsedData.items.map(item => ({
                    ...item,
                    id: item.id || Math.random().toString(36).substring(2, 9)
                }));

                setReceipt({
                    ...parsedData,
                    items: itemsWithIds
                });

                // Set tax and discount initial values
                if (parsedData.tax) setTax(parsedData.tax.toString());
                if (parsedData.discount) setDiscount(parsedData.discount.toString());

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

    // Recalculate totals when items, tax, or discount change
    useEffect(() => {
        if (!receipt) return;

        // Calculate subtotal
        const subtotal = receipt.items.reduce((sum, item) => sum + item.price, 0);
        setCalculatedSubtotal(subtotal);

        // Calculate total with tax and discount
        const taxValue = parseFloat(tax) || 0;
        const discountValue = parseFloat(discount) || 0;

        let total = subtotal;

        // Add tax if percentage
        if (taxValue > 0) {
            total += (subtotal * (taxValue / 100));
        }

        // Subtract discount if percentage
        if (discountValue > 0) {
            total -= (subtotal * (discountValue / 100));
        }

        setCalculatedTotal(total);
    }, [receipt, tax, discount]);

    const handleAddItem = () => {
        if (!receipt) return;

        const newItem = {
            name: "New Item",
            price: 0,
            id: Math.random().toString(36).substring(2, 9)
        };

        setReceipt({
            ...receipt,
            items: [...receipt.items, newItem]
        });

        // Start editing the new item
        setIsEditing(newItem.id);
        setEditName(newItem.name);
        setEditPrice("0");
    };

    const handleEditItem = (item: ReceiptItem) => {
        setIsEditing(item.id);
        setEditName(item.name);
        setEditPrice(item.price.toString());
    };

    const handleSaveEdit = (id: string) => {
        if (!receipt) return;

        const price = parseFloat(editPrice.replace(',', '.')) || 0;

        setReceipt({
            ...receipt,
            items: receipt.items.map(item =>
                item.id === id ? { ...item, name: editName, price } : item
            )
        });

        setIsEditing(null);
    };

    const handleDeleteItem = (id: string) => {
        if (!receipt) return;

        setReceipt({
            ...receipt,
            items: receipt.items.filter(item => item.id !== id)
        });
    };

    const handleContinue = () => {
        if (!receipt) return;

        // Update receipt data with calculated values
        const updatedReceipt = {
            ...receipt,
            subtotal: calculatedSubtotal,
            tax: parseFloat(tax) || 0,
            discount: parseFloat(discount) || 0,
            total: calculatedTotal
        };

        // Save updated receipt data to session storage
        sessionStorage.setItem('receiptData', JSON.stringify(updatedReceipt));

        // Navigate to the next page (participants selection)
        router.push('/participants');
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

    if (!receipt) {
        return (
            <div className="container mx-auto px-4 py-10 max-w-4xl pt-28 mt-4 text-center">
                <h1 className="text-2xl font-bold mb-4">Memuat hasil scan...</h1>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-10 max-w-4xl pt-28 mt-4">
            <h1 className="text-3xl font-bold mb-6">Hasil Scan Nota</h1>

            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Daftar Item</h2>
                    <button
                        onClick={handleAddItem}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-3 rounded-lg flex items-center gap-1 text-sm transition-colors"
                    >
                        <Plus size={16} />
                        Tambah Item
                    </button>
                </div>

                {/* List of items */}
                <div className="mb-6">
                    {receipt.items.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                            <p>Tidak ada item ditemukan. Silakan tambahkan item secara manual.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {receipt.items.map(item => (
                                <div
                                    key={item.id}
                                    className="border dark:border-zinc-700 border-gray-200 rounded-lg p-4"
                                >
                                    {isEditing === item.id ? (
                                        <div className="flex flex-col space-y-3">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="px-3 py-2 border dark:border-zinc-600 dark:bg-zinc-700 dark:text-white border-gray-300 rounded-lg w-full"
                                                placeholder="Nama item"
                                            />
                                            <div className="flex items-center">
                                                <input
                                                    type="text"
                                                    value={editPrice}
                                                    onChange={(e) => setEditPrice(e.target.value.replace(/[^0-9.,]/g, ''))}
                                                    className="px-3 py-2 border dark:border-zinc-600 dark:bg-zinc-700 dark:text-white border-gray-300 rounded-lg w-full"
                                                    placeholder="Harga"
                                                />
                                            </div>
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => setIsEditing(null)}
                                                    className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                                                >
                                                    Batal
                                                </button>
                                                <button
                                                    onClick={() => handleSaveEdit(item.id)}
                                                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-colors"
                                                >
                                                    Simpan
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium dark:text-white">{item.name}</p>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <p className="font-semibold dark:text-white">Rp {item.price.toLocaleString('id-ID')}</p>
                                                <button
                                                    onClick={() => handleEditItem(item)}
                                                    className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteItem(item.id)}
                                                    className="text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Tax and Discount */}
                <div className="bg-gray-50 dark:bg-zinc-700/40 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-medium mb-4">Tambahan</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">
                                Pajak (%)
                            </label>
                            <input
                                type="text"
                                value={tax}
                                onChange={(e) => setTax(e.target.value.replace(/[^0-9.,]/g, ''))}
                                className="px-3 py-2 border dark:border-zinc-600 dark:bg-zinc-700 dark:text-white border-gray-300 rounded-lg w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">
                                Diskon (%)
                            </label>
                            <input
                                type="text"
                                value={discount}
                                onChange={(e) => setDiscount(e.target.value.replace(/[^0-9.,]/g, ''))}
                                className="px-3 py-2 border dark:border-zinc-600 dark:bg-zinc-700 dark:text-white border-gray-300 rounded-lg w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div className="border-t dark:border-zinc-700 border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                        <span className="font-medium dark:text-white">Rp {calculatedSubtotal.toLocaleString('id-ID')}</span>
                    </div>

                    {parseFloat(tax) > 0 && (
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600 dark:text-gray-400">Pajak ({tax}%):</span>
                            <span className="font-medium dark:text-white">
                                Rp {(calculatedSubtotal * (parseFloat(tax) / 100)).toLocaleString('id-ID')}
                            </span>
                        </div>
                    )}

                    {parseFloat(discount) > 0 && (
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600 dark:text-gray-400">Diskon ({discount}%):</span>
                            <span className="font-medium text-green-600 dark:text-green-400">
                                -Rp {(calculatedSubtotal * (parseFloat(discount) / 100)).toLocaleString('id-ID')}
                            </span>
                        </div>
                    )}

                    <div className="flex justify-between items-center mt-4 pt-4 border-t dark:border-zinc-700 border-gray-200">
                        <span className="font-semibold text-lg dark:text-white">Total:</span>
                        <span className="font-bold text-lg dark:text-white">Rp {calculatedTotal.toLocaleString('id-ID')}</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <Link
                    href="/scan"
                    className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                >
                    &larr; Kembali ke Scan
                </Link>

                <button
                    onClick={handleContinue}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-5 rounded-lg transition-colors flex items-center gap-2"
                >
                    Lanjut
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}
