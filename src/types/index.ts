export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  barcode?: string;
  description?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export type CustomerMode = 'dine-in' | 'take-away';

export interface Order {
  id: string;
  table_number?: string;
  status: 'pending' | 'in_progress' | 'done' | 'cancelled';
  total_amount: number;
  payment_method?: string;
  customer_mode?: CustomerMode; // Kolom baru
  notes?: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  users?: User; // <- Perbaikan dari 'user' menjadi 'users'
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  qty: number;
  notes?: string;
  created_at: string;
  product?: Product;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export interface User {
  id: string;
  auth_id?: string;
  name?: string;
  email?: string;
  phone_number?: string;
  role: 'admin' | 'cashier' | 'guest';
  created_at?: string;
}

export type PaymentMethod = 'cash' | 'qris' | 'card' | 'transfer';

export interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  popularItems: Array<{
    product_name: string;
    total_quantity: number;
  }>;
  lowStockItems: Product[];
}