import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Order } from '../types'

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (*)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const createOrder = async (orderData: {
    table_number?: string
    total_amount: number
    payment_method?: string
    notes?: string
    items: Array<{
      product_id: string
      quantity: number
      price: number
      notes?: string
    }>
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          table_number: orderData.table_number,
          total_amount: orderData.total_amount,
          payment_method: orderData.payment_method,
          notes: orderData.notes,
          status: 'pending',
          cashier_id: user.id 
        }])
        .select()
        .single()

      if (orderError) throw orderError

// Create order items
      const orderItems = orderData.items.map(item => ({
      product_id: item.product_id,
      qty: item.quantity,
      order_id: order.id
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      await fetchOrders()
      return { data: order, error: null }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to create order'
      return { data: null, error }
    }
  }

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      // // If order is marked as done, deduct stock
      // if (status === 'done') {
      //   const order = orders.find(o => o.id === id)
      //   if (order?.order_items) {
      //     for (const item of order.order_items) {
      //       await supabase.rpc('deduct_stock', {
      //         product_id: item.product_id,
      //         quantity: item.quantity
      //       })
      //     }
      //   }
      // }

      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
      return { data, error: null }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to update order'
      return { data: null, error }
    }
  }

  useEffect(() => {
    fetchOrders()

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('orders')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrderStatus,
    refetch: fetchOrders,
  }
}