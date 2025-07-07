import { createClient } from '@supabase/supabase-js';

// Supabase client configuration - using environment variables
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a singleton Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Type definitions for receipt data
export type ReceiptItem = {
    id: string;
    name: string;
    price: number;
    assignedTo?: string[];
    splitEvenly?: boolean;
};

export type Participant = {
    id: string;
    name: string;
    total?: number;
    items?: Array<{
        id: string;
        name: string;
        price: number;
        portion: number;
    }>;
};

export type ReceiptData = {
    items: ReceiptItem[];
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    rawText: string;
    imageUrl: string;
    participants?: Participant[];
    currentUserId?: string;
    sharedLink?: string;
};

export type SharedBillData = {
    id: string;
    user_id: string;
    receipt_data: ReceiptData;
    participant_summaries: Participant[];
    created_at: string;
    updated_at?: string;
};

// Helper function to save a split bill to Supabase
export async function saveSplitBill(userId: string, receiptData: ReceiptData, participantSummaries: Participant[]) {
    try {
        const { data, error } = await supabase
            .from('split_bills')
            .insert([{
                user_id: userId,
                receipt_data: receiptData,
                participant_summaries: participantSummaries,
                created_at: new Date().toISOString()
            }])
            .select();

        if (error) throw error;
        return data?.[0] || null;
    } catch (error) {
        console.error('Error saving split bill:', error);
        throw error;
    }
}

// Helper function to fetch a shared bill by ID
export async function getSharedBill(id: string) {
    try {
        const { data, error } = await supabase
            .from('split_bills')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as SharedBillData;
    } catch (error) {
        console.error('Error fetching shared bill:', error);
        throw error;
    }
}

// Helper function to fetch all bills for a user
export async function getUserBills(userId: string) {
    try {
        const { data, error } = await supabase
            .from('split_bills')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as SharedBillData[];
    } catch (error) {
        console.error('Error fetching user bills:', error);
        throw error;
    }
}
