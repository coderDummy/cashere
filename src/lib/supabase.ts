import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://aqsxzzdcwspiqufxtmro.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxc3h6emRjd3NwaXF1Znh0bXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNTQ5NzYsImV4cCI6MjA2NTczMDk3Nn0.7l7Hk2sjQ2nBmRUa0VYdmFL78JKlPip_QLkzVYt8r18'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          price: number
          stock: number
          category: string
          barcode?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          price: number
          stock: number
          category: string
          barcode?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          price?: number
          stock?: number
          category?: string
          barcode?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          table_number?: string
          status: 'pending' | 'in_progress' | 'done' | 'cancelled'
          total_amount: number
          payment_method?: string
          notes?: string
          cashier_id?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          table_number?: string
          status?: 'pending' | 'in_progress' | 'done' | 'cancelled'
          total_amount: number
          payment_method?: string
          notes?: string
          cashier_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          table_number?: string
          status?: 'pending' | 'in_progress' | 'done' | 'cancelled'
          total_amount?: number
          payment_method?: string
          notes?: string
          cashier_id?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          notes?: string
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          notes?: string
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          notes?: string
        }
      }
    }
  }
}