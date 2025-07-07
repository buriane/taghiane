"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useAuthModal } from "@/components/useAuthModal";
import SplashScreen from "@/components/SplashScreen";
import { Download, Home, RefreshCcw } from "lucide-react";
import { ReceiptData, Participant } from "@/lib/supabase";
import jsPDF from 'jspdf';

export default function SummaryPage() {
    const { isLoaded, userId } = useAuth();
    const { openAuthModal } = useAuthModal();
    const [, setLoadingComplete] = useState(false);
    const [receipt, setReceipt] = useState<ReceiptData | null>(null);
    const [participantSummaries, setParticipantSummaries] = useState<Participant[]>([]);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const router = useRouter();
    const billContentRef = useRef<HTMLDivElement>(null);

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

                // Check if items and participants exist, otherwise redirect
                if (!parsedData.items || !parsedData.participants || parsedData.participants.length === 0) {
                    router.push('/scan');
                    return;
                }

                setReceipt(parsedData);

                // Calculate totals for each participant
                calculateParticipantTotals(parsedData);

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

    const calculateParticipantTotals = (receiptData: ReceiptData) => {
        if (!receiptData.participants || !receiptData.items) return;

        const totals: { [key: string]: Participant } = {};

        // Initialize participant totals
        receiptData.participants.forEach(participant => {
            totals[participant.id] = {
                ...participant,
                total: 0,
                items: []
            };
        });

        // Calculate per-item costs
        receiptData.items.forEach(item => {
            // Skip items that aren't assigned to anyone
            if (!item.assignedTo || item.assignedTo.length === 0) return;

            const numAssigned = item.assignedTo.length;
            const pricePerPerson = item.price / numAssigned;

            item.assignedTo.forEach(participantId => {
                if (totals[participantId]) {
                    totals[participantId].total = (totals[participantId].total || 0) + pricePerPerson;
                    totals[participantId].items?.push({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        portion: pricePerPerson
                    });
                }
            });
        });

        // Add tax and discount proportionally
        if (receiptData.tax > 0 || receiptData.discount > 0) {
            // Calculate subtotal of all assigned items
            const assignedSubtotal = receiptData.items.reduce((sum, item) => {
                if (item.assignedTo && item.assignedTo.length > 0) {
                    return sum + item.price;
                }
                return sum;
            }, 0);

            if (assignedSubtotal > 0) {
                // Calculate total tax and discount amounts
                const taxAmount = (receiptData.subtotal * (receiptData.tax / 100));
                const discountAmount = (receiptData.subtotal * (receiptData.discount / 100));

                // Distribute to participants based on their proportion of the bill
                Object.keys(totals).forEach(participantId => {
                    const participant = totals[participantId];
                    if (!participant.total) return;

                    const proportion = participant.total / assignedSubtotal;
                    const taxShare = taxAmount * proportion;
                    const discountShare = discountAmount * proportion;

                    // Update total with tax and discount
                    participant.total = participant.total + taxShare - discountShare;
                });
            }
        }

        // Convert to array and sort by total
        const summaries = Object.values(totals).sort((a, b) =>
            ((b.total || 0) - (a.total || 0))
        );

        setParticipantSummaries(summaries);
    };    // Function to create a simplified version of the bill for PDF generation
    const handleGeneratePDF = async () => {
        if (!receipt || !participantSummaries) return;

        setIsGeneratingPDF(true);
        try {
            // Create a PDF directly without using html2canvas
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const margin = 20;
            const contentWidth = pageWidth - (margin * 2);
            let yPosition = margin;

            // Set fonts
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(18);

            // Add title
            pdf.text("Ringkasan Split Bill", margin, yPosition);
            yPosition += 10;

            // Add date
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(10);
            pdf.text(`Dibuat pada: ${new Date().toLocaleDateString('id-ID')}`, margin, yPosition);
            yPosition += 15;

            // Total section
            pdf.setFillColor(240, 249, 255); // Light blue background
            pdf.rect(margin, yPosition, contentWidth, 30, 'F');
            yPosition += 6;

            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(12);
            pdf.text("Total Tagihan", margin + 5, yPosition);
            yPosition += 7;

            pdf.setFontSize(16);
            pdf.text(`Rp ${receipt.total.toLocaleString('id-ID')}`, margin + 5, yPosition);
            yPosition += 8;

            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            pdf.text(`Subtotal: Rp ${receipt.subtotal.toLocaleString('id-ID')}`, margin + 5, yPosition);

            if (receipt.tax > 0) {
                const taxAmount = (receipt.subtotal * (receipt.tax / 100));
                pdf.text(`Pajak (${receipt.tax}%): Rp ${taxAmount.toLocaleString('id-ID')}`, margin + contentWidth / 2, yPosition);
            }

            yPosition += 5;
            if (receipt.discount > 0) {
                const discountAmount = (receipt.subtotal * (receipt.discount / 100));
                pdf.text(`Diskon (${receipt.discount}%): -Rp ${discountAmount.toLocaleString('id-ID')}`, margin + 5, yPosition);
            }

            yPosition += 15;

            // Participant section
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(14);
            pdf.text("Pembagian Per Peserta", margin, yPosition);
            yPosition += 10;

            // For each participant
            for (const participant of participantSummaries) {
                pdf.setDrawColor(200, 200, 200);
                pdf.setFillColor(249, 250, 251); // Light gray
                pdf.rect(margin, yPosition, contentWidth, 12, 'FD');

                // Participant name and total
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(12);
                pdf.text(participant.name, margin + 5, yPosition + 8);

                const totalText = `Rp ${participant.total?.toLocaleString('id-ID')}`;
                const totalWidth = pdf.getTextWidth(totalText);
                pdf.text(totalText, pageWidth - margin - totalWidth - 5, yPosition + 8);

                yPosition += 16;

                // Check if we need a new page
                if (yPosition > pdf.internal.pageSize.getHeight() - 30) {
                    pdf.addPage();
                    yPosition = margin;
                }

                // Items ordered
                if (participant.items && participant.items.length > 0) {
                    pdf.setFont("helvetica", "normal");
                    pdf.setFontSize(10);
                    pdf.text("Item yang dipesan:", margin + 5, yPosition);
                    yPosition += 6;

                    for (const item of participant.items) {
                        const isShared = item.price !== item.portion;
                        const itemName = isShared ? `${item.name} (dibagi)` : item.name;
                        pdf.text(itemName, margin + 10, yPosition);

                        const itemPrice = `Rp ${item.portion.toLocaleString('id-ID')}`;
                        const itemPriceWidth = pdf.getTextWidth(itemPrice);
                        pdf.text(itemPrice, pageWidth - margin - itemPriceWidth - 5, yPosition);

                        yPosition += 5;

                        // Check if we need a new page
                        if (yPosition > pdf.internal.pageSize.getHeight() - 20) {
                            pdf.addPage();
                            yPosition = margin;
                        }
                    }

                    yPosition += 5;
                }

                // Add some space between participants
                yPosition += 8;

                // Check if we need a new page for the next participant
                if (yPosition > pdf.internal.pageSize.getHeight() - 40) {
                    pdf.addPage();
                    yPosition = margin;
                }
            }

            // Save the PDF
            const filename = `tagihan-split-bill-${new Date().toISOString().slice(0, 10)}.pdf`;
            pdf.save(filename);
        } catch (err) {
            console.error('Error generating PDF:', err);
            alert('Gagal membuat PDF. Silakan coba lagi: ' + (err instanceof Error ? err.message : String(err)));
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const handleNewSplit = () => {
        // Clear session storage and redirect to home
        sessionStorage.removeItem('receiptData');
        router.push('/');
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

    if (!receipt || participantSummaries.length === 0) {
        return (
            <div className="container mx-auto px-4 py-10 max-w-4xl pt-28 mt-4 text-center">
                <h1 className="text-2xl font-bold mb-4">Memuat data...</h1>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-10 max-w-4xl pt-28 mt-4">
            <h1 className="text-3xl font-bold mb-6">Ringkasan Split Bill</h1>

            <div ref={billContentRef} className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6 mb-8">
                {/* Total Summary */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                    <h2 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Total Tagihan</h2>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">
                        Rp {receipt.total.toLocaleString('id-ID')}
                    </p>
                    <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                        <div>
                            <p className="text-blue-700 dark:text-blue-400">Subtotal</p>
                            <p className="font-medium text-blue-800 dark:text-blue-300">
                                Rp {receipt.subtotal.toLocaleString('id-ID')}
                            </p>
                        </div>
                        {receipt.tax > 0 && (
                            <div>
                                <p className="text-blue-700 dark:text-blue-400">Pajak ({receipt.tax}%)</p>
                                <p className="font-medium text-blue-800 dark:text-blue-300">
                                    Rp {(receipt.subtotal * (receipt.tax / 100)).toLocaleString('id-ID')}
                                </p>
                            </div>
                        )}
                        {receipt.discount > 0 && (
                            <div>
                                <p className="text-blue-700 dark:text-blue-400">Diskon ({receipt.discount}%)</p>
                                <p className="font-medium text-green-600 dark:text-green-400">
                                    -Rp {(receipt.subtotal * (receipt.discount / 100)).toLocaleString('id-ID')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Participant Breakdown */}
                <h2 className="text-xl font-semibold mb-4">Pembagian Per Peserta</h2>

                <div className="space-y-4">
                    {participantSummaries.map(participant => (
                        <div
                            key={participant.id}
                            className="border dark:border-zinc-700 border-gray-200 rounded-lg overflow-hidden"
                        >
                            <div className="bg-gray-50 dark:bg-zinc-700/40 p-4 flex justify-between items-center">
                                <h3 className="font-medium text-gray-900 dark:text-white">
                                    {participant.name}
                                    {participant.id === userId && (
                                        <span className="ml-2 text-sm bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full">
                                            You
                                        </span>
                                    )}
                                </h3>
                                <div className="text-right">
                                    <p className="font-bold text-lg text-gray-900 dark:text-white">
                                        Rp {participant.total?.toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </div>

                            {participant.items && participant.items.length > 0 && (
                                <div className="p-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                        Item yang dipesan:
                                    </p>
                                    <div className="space-y-2">
                                        {participant.items.map(item => (
                                            <div
                                                key={item.id + participant.id}
                                                className="flex justify-between text-sm"
                                            >
                                                <span className="text-gray-700 dark:text-gray-300">
                                                    {item.name}
                                                    {item.price !== item.portion && (
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {' '}(dibagi)
                                                        </span>
                                                    )}
                                                </span>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    Rp {item.portion.toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Download Section */}
                <div className="mt-8 border-t dark:border-zinc-700 border-gray-200 pt-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Download size={20} />
                        Unduh Ringkasan
                    </h2>

                    <button
                        onClick={handleGeneratePDF}
                        disabled={isGeneratingPDF}
                        className={`w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2
                            ${isGeneratingPDF ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isGeneratingPDF ? 'Membuat PDF...' : 'Unduh Sebagai PDF'}
                    </button>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <Link
                    href="/assign"
                    className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                >
                    &larr; Kembali ke Penugasan
                </Link>

                <div className="flex space-x-3">
                    <button
                        onClick={handleNewSplit}
                        className="bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <RefreshCcw size={16} />
                        Split Bill Baru
                    </button>

                    <Link href="/">
                        <button className="bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 text-gray-800 dark:text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center gap-2">
                            <Home size={16} />
                            Beranda
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
