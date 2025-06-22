import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Order } from '../types'

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          user:users (*),
          order_items (
            *,
            product:products (*)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data as Order[] || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }, [])

  const createOrder = async (orderData: {
    table_number?: string
    total_amount: number
    payment_method?: string
    notes?: string
    name?: string
    phoneNumber?: string
    items: Array<{
      product_id: string
      quantity: number
      notes?: string
    }>
  }) => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      let finalUserId: string | undefined;

      if (authUser) {
        let { data: userProfile } = await supabase.from('users').select('id').eq('auth_id', authUser.id).single();
        finalUserId = userProfile?.id;
      } else if (orderData.phoneNumber) {
        const { data: guestUser, error: guestUserError } = await supabase
          .from('users')
          .upsert(
            { phone_number: orderData.phoneNumber, name: orderData.name, role: 'guest' },
            { onConflict: 'phone_number', ignoreDuplicates: false }
          )
          .select('id')
          .single();
        if (guestUserError) throw guestUserError;
        finalUserId = guestUser?.id;
      }

      if (!finalUserId) {
        throw new Error('User information is missing.');
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          table_number: orderData.table_number,
          total_amount: orderData.total_amount,
          payment_method: orderData.payment_method,
          notes: orderData.notes,
          status: 'pending',
          user_id: finalUserId
        }])
        .select()
        .single()

      if (orderError) throw orderError

      // PERBAIKAN: Mengirim `qty` ke database, bukan `quantity`. Menghapus `price`.
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        qty: item.quantity,
        notes: item.notes
      }))

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
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
      setOrders(prev => prev.map(o => o.id === id ? { ...data as Order, status: data.status } : o))
      return { data, error: null }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to update order'
      return { data: null, error }
    }
  }

  useEffect(() => {
    fetchOrders()
    const channel = supabase
      .channel('realtime-orders')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchOrders()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'order_items'},
        () => fetchOrders()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchOrders])

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrderStatus,
    refetch: fetchOrders,
  }
}