import { createClient } from '@supabase/supabase-js';
import { Product, Order, OrderItem, User, CustomerMode } from '../types';

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseUrl = 'https://aqsxzzdcwspiqufxtmro.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxc3h6emRjd3NwaXF1Znh0bXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNTQ5NzYsImV4cCI6MjA2NTczMDk3Nn0.7l7Hk2sjQ2nBmRUa0VYdmFL78JKlPip_QLkzVYt8r18'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be provided in .env file");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export type Database = {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>;
      };
      orders: {
        Row: Order;
        Insert: {
          id?: string;
          table_number?: string;
          status?: 'pending' | 'in_progress' | 'done' | 'cancelled';
          total_amount: number;
          payment_method?: string;
          customer_mode?: CustomerMode; // Kolom baru
          notes?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          table_number?: string;
          status?: 'pending' | 'in_progress' | 'done' | 'cancelled';
          total_amount?: number;
          payment_method?: string;
          customer_mode?: CustomerMode; // Kolom baru
          notes?: string;
          user_id?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, 'id' | 'created_at' | 'product'>;
        Update: Partial<Omit<OrderItem, 'id' | 'created_at' | 'product'>>;
      };
      users: {
        Row: User;
        Insert: Partial<User>;
        Update: Partial<User>;
      };
    };
  };
};