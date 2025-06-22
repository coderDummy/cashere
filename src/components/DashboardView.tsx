// src/components/DashboardView.tsx

import { DollarSign, ShoppingBag, TrendingUp, AlertTriangle } from 'lucide-react'
import { useDashboardStats } from '../hooks/useDashboardStats'

export function DashboardView() {
  // ARSITEKTUR: Menggunakan hook yang sudah direfaktor, membuat komponen ini bersih
  const { stats, loading, error } = useDashboardStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
      return (
          <div className="flex flex-col items-center justify-center h-64 bg-red-50 text-red-700 p-4 rounded-lg">
            <AlertTriangle className="w-12 h-12 mb-4" />
            <p className="font-semibold">Failed to load dashboard data</p>
            <p className="text-sm">{error}</p>
          </div>
      )
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <div className="bg-white p-4 lg:p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-md">
              <DollarSign className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
            </div>
            <div className="ml-3 lg:ml-4">
              <p className="text-xs lg:text-sm font-medium text-gray-600">Today's Revenue</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900"> Rp {new Intl.NumberFormat('id-ID').format(stats.todayRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 lg:p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-md">
              <ShoppingBag className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
            </div>
            <div className="ml-3 lg:ml-4">
              <p className="text-xs lg:text-sm font-medium text-gray-600">Today's Orders</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.todayOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 lg:p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-md">
              <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
            </div>
            <div className="ml-3 lg:ml-4">
              <p className="text-xs lg:text-sm font-medium text-gray-600">Popular Items</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.popularItems.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 lg:p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-md">
              <AlertTriangle className="w-5 h-5 lg:w-6 lg:h-6 text-red-600" />
            </div>
            <div className="ml-3 lg:ml-4">
              <p className="text-xs lg:text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.lowStockItems.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Popular Items */}
        <div className="bg-white p-4 lg:p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Items (Last 7 Days)</h3>
          {stats.popularItems.length === 0 ? (
            <p className="text-gray-500">No data available</p>
          ) : (
            <div className="space-y-3">
              {stats.popularItems.map((item) => (
                <div key={item.product_name} className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 text-sm lg:text-base">{item.product_name}</span>
                  <span className="text-sm text-gray-600">{item.total_quantity} sold</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Items */}
        <div className="bg-white p-4 lg:p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alert</h3>
          {stats.lowStockItems.length === 0 ? (
            <p className="text-green-600">All items are well stocked!</p>
          ) : (
            <div className="space-y-3">
              {stats.lowStockItems.map(item => (
                <div key={item.id} className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 text-sm lg:text-base">{item.name}</span>
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