// src/hooks/useGuestOrders.ts

import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Order } from '../types';

const PAGE_SIZE = 5;

export function useGuestOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  // Menggunakan page berbasis 0 untuk memudahkan kalkulasi `range`
  const [currentPage, setCurrentPage] = useState(0);

  const fetchOrdersByPhone = useCallback(async (phoneInput: string) => {
    setLoading(true);
    setError(null);
    setOrders([]);
    setCurrentPage(0);
    setHasMore(true);
    setPhone(phoneInput);

    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('phone_number', phoneInput)
        .single();
      
      if (!userData) {
        throw new Error('No user found for this phone number.');
      }
      
      const userId = userData.id;
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*, order_items(*, product:products(*))')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(0, PAGE_SIZE - 1);

      if (ordersError) throw ordersError;
      
      setOrders(ordersData || []);
      if ((ordersData || []).length < PAGE_SIZE) {
        setHasMore(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !phone) return;

    setLoadingMore(true);
    const nextPage = currentPage + 1;
    
    try {
      const { data: userData } = await supabase.from('users').select('id').eq('phone_number', phone).single();
      if (!userData) return;

      const from = nextPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data: newOrders, error } = await supabase
        .from('orders')
        .select('*, order_items(*, product:products(*))')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      
      setOrders(prev => [...prev, ...(newOrders || [])]);
      setCurrentPage(nextPage);
      if ((newOrders || []).length < PAGE_SIZE) {
        setHasMore(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more orders.');
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, hasMore, loadingMore, phone]);

  return { orders, loading, loadingMore, error, hasMore, fetchOrdersByPhone, loadMore };
}