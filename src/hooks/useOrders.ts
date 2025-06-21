// src/hooks/useOrders.ts

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Order, OrderItem } from '../types' // Pastikan OrderItem di-import

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
          user:users (*),
          order_items (
            *,
            product:products (*)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const formattedData = data?.map(order => ({
        ...order,
        order_items: order.order_items.map((item: any) => ({
          ...item,
          quantity: item.qty // Buat properti `quantity` dari `qty`
        }))
      })) || []

      setOrders(formattedData as Order[])
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
    name?: string
    phoneNumber?: string
    items: Array<{
      product_id: string
      quantity: number
      notes?: string
      // Kita tidak perlu mengirim harga dari UI
    }>
  }) => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      let finalUserId: string | null = null;

      if (authUser) {
        let { data: userProfile } = await supabase.from('users').select('id').eq('auth_id', authUser.id).single();
        if (!userProfile) {
          const { data: newUserProfile } = await supabase.from('users').insert({ auth_id: authUser.id, role: 'admin', name: authUser.email }).select('id').single();
          userProfile = newUserProfile;
        }
        finalUserId = userProfile?.id ?? null;
      } else if (orderData.phoneNumber) {
        const { data: guestUser, error: guestUserError } = await supabase.from('users').upsert({ phone_number: orderData.phoneNumber, name: orderData.name, role: 'guest' }, { onConflict: 'phone_number', ignoreDuplicates: false }).select('id').single();
        if (guestUserError) throw guestUserError;
        finalUserId = guestUser.id;
      } else {
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

      // PENERJEMAHAN DARI UI (quantity) -> KE DATABASE (qty)
      // dan pastikan tidak mengirim `price`
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        qty: item.quantity, // Ubah 'quantity' UI menjadi 'qty' DB
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
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
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