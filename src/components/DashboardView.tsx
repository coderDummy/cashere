import React, { useState, useEffect } from 'react'
import { DollarSign, ShoppingBag, TrendingUp, AlertTriangle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { DashboardStats } from '../types'

export function DashboardView() {
  const [stats, setStats] = useState<DashboardStats>({
    todayRevenue: 0,
    todayOrders: 0,
    popularItems: [],
    lowStockItems: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]

      // Today's revenue and orders
      const { data: todayOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', today)
        .eq('status', 'done')

      const todayRevenue = todayOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0
      const todayOrdersCount = todayOrders?.length || 0

      // Popular items (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data: popularItems } = await supabase
        .from('order_items')
        .select(`
          quantity,
          product:products(name)
        `)
        .gte('created_at', sevenDaysAgo.toISOString())

      const itemCounts = popularItems?.reduce((acc, item) => {
        const name = item.product?.name || 'Unknown'
        acc[name] = (acc[name] || 0) + item.quantity
        return acc
      }, {} as Record<string, number>) || {}

      const popularItemsArray = Object.entries(itemCounts)
        .map(([product_name, total_quantity]) => ({ product_name, total_quantity }))
        .sort((a, b) => b.total_quantity - a.total_quantity)
        .slice(0, 5)

      // Low stock items
      const { data: lowStockItems } = await supabase
        .from('products')
        .select('*')
        .lte('stock', 10)
        .order('stock')

      setStats({
        todayRevenue,
        todayOrders: todayOrdersCount,
        popularItems: popularItemsArray,
        lowStockItems: lowStockItems || []
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-md">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${stats.todayRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-md">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-md">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Popular Items</p>
              <p className="text-2xl font-bold text-gray-900">{stats.popularItems.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-md">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-gray-900">{stats.lowStockItems.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Items */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Items (Last 7 Days)</h3>
          {stats.popularItems.length === 0 ? (
            <p className="text-gray-500">No data available</p>
          ) : (
            <div className="space-y-3">
              {stats.popularItems.map((item, index) => (
                <div key={item.product_name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 mr-3">
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-900">{item.product_name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{item.total_quantity} sold</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Items */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alert</h3>
          {stats.lowStockItems.length === 0 ? (
            <p className="text-green-600">All items are well stocked!</p>
          ) : (
            <div className="space-y-3">
              {stats.lowStockItems.map(item => (
                <div key={item.id} className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{item.name}</span>
                  <span className={`text-sm font-medium ${item.stock === 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                    {item.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}