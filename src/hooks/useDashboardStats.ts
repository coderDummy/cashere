import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { DashboardStats, Product } from '../types'
import { PostgrestError } from '@supabase/supabase-js'

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    todayRevenue: 0,
    todayOrders: 0,
    popularItems: [],
    lowStockItems: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayISO = today.toISOString()
      
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data: todayOrdersData, error: todayOrdersError } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', todayISO)
        .eq('status', 'done')

      if (todayOrdersError) throw todayOrdersError

      // ======================= PERBAIKAN UTAMA DI SINI =======================
      // Query diubah untuk memfilter berdasarkan `created_at` dari tabel `orders` yang di-join.
      const { data: popularItemsData, error: popularItemsError } = await supabase
        .from('order_items')
        .select('qty, product:products(name), orders!inner(created_at)') // Lakukan inner join ke tabel orders
        .gte('orders.created_at', sevenDaysAgo.toISOString()) // Filter berdasarkan kolom dari tabel yang di-join
      // =======================================================================

      if (popularItemsError) throw popularItemsError

      const { data: lowStockItemsData, error: lowStockItemsError } = await supabase
        .from('products')
        .select('*')
        .lte('stock', 10)
        .order('stock')

      if (lowStockItemsError) throw lowStockItemsError

      const todayRevenue = todayOrdersData?.reduce((sum, order) => sum + order.total_amount, 0) || 0
      const todayOrdersCount = todayOrdersData?.length || 0
      
      const itemCounts = popularItemsData?.reduce((acc: Record<string, number>, item: any) => {
        if (item && item.product && typeof item.product.name === 'string' && typeof item.qty === 'number') {
            const name = item.product.name;
            acc[name] = (acc[name] || 0) + item.qty;
        }
        return acc;
      }, {}) || {};

      const popularItemsArray = Object.entries(itemCounts)
        .map(([product_name, total_quantity]) => ({ product_name, total_quantity }))
        .sort((a, b) => b.total_quantity - a.total_quantity)
        .slice(0, 5)

      setStats({
        todayRevenue,
        todayOrders: todayOrdersCount,
        popularItems: popularItemsArray,
        lowStockItems: (lowStockItemsData as Product[]) || []
      })
    } catch (err) {
      if (err instanceof Error || (err && typeof (err as PostgrestError).message === 'string')) {
        setError((err as { message: string }).message)
      } else {
        setError('Failed to fetch dashboard stats')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardStats()
  }, [fetchDashboardStats])

  return { stats, loading, error, refetch: fetchDashboardStats }
}