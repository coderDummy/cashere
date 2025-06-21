import { useState } from 'react'
import { Clock, CheckCircle, XCircle, Play, Package, Filter } from 'lucide-react'
import { useOrders } from '../hooks/useOrders'
import { Order } from '../types'
import { CornerDownRight, /* ikon-ikon lain yang sudah ada */ } from 'lucide-react'

export function OrdersView() {
  const { orders, updateOrderStatus } = useOrders()
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'done' | 'cancelled'>('all')
  const [showMobileFilter, setShowMobileFilter] = useState(false)

  const filteredOrders = orders.filter(order => 
    filter === 'all' || order.status === filter
  )

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'in_progress':
        return <Play className="w-4 h-4 text-blue-500" />
      case 'done':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'done':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    await updateOrderStatus(orderId, newStatus)
  }

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Orders</h2>
        
        {/* Mobile Filter Button */}
        <button
          onClick={() => setShowMobileFilter(true)}
          className="lg:hidden flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filter
        </button>

        {/* Desktop Status Filter */}
        <div className="hidden lg:flex gap-2">
          {filterOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value as any)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === option.value
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showMobileFilter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50 lg:hidden">
          <div className="bg-white rounded-t-lg w-full p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Orders</h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {filterOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    setFilter(option.value as any)
                    setShowMobileFilter(false)
                  }}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === option.value
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowMobileFilter(false)}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-3 lg:space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500">Orders will appear here when customers place them</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">
                      Order #{order.id.slice(-8)}
                    </h3>
                    {order.table_number && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                        Table {order.table_number}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                
                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3">
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status.replace('_', ' ')}
                  </span>
                  <span className="font-bold text-lg text-gray-900">
                    Rp {new Intl.NumberFormat('id-ID').format(order.total_amount)}
                  </span>
                </div>
              </div>

              {/* Order Items */}
{/* Jangan lupa import ikonnya di atas file */}
              {/* import { CornerDownRight } from 'lucide-react' */}

              {order.order_items && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Items:</h4>
                  <div className="space-y-3"> {/* Beri sedikit jarak lebih antar item */}
                    {order.order_items.map(item => (
                      <div key={item.id}>
                        {/* Baris untuk Nama Item dan Harga */}
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-gray-800">{item.product?.name} x {item.qty}</span>
                          <span className="font-semibold">
                            Rp {( (item.product?.price ?? 0) * item.qty).toLocaleString('id-ID')}
                          </span>
                        </div>

                        {/* Tampilkan Notes HANYA jika ada isinya */}
                        {item.notes && (
                          <div className="flex items-start gap-2 pt-1 pl-2">
                            <CornerDownRight className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-gray-600 italic">
                              {item.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {order.notes && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-1">Notes:</h4>
                  <p className="text-sm text-gray-600">{order.notes}</p>
                </div>
              )}

              {/* Status Actions */}
              <div className="flex flex-wrap gap-2">
                {order.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(order.id, 'in_progress')}
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors"
                    >
                      Start Preparing
                    </button>
                    <button
                      onClick={() => handleStatusChange(order.id, 'cancelled')}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md text-sm font-medium hover:bg-red-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {order.status === 'in_progress' && (
                  <button
                    onClick={() => handleStatusChange(order.id, 'done')}
                    className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md text-sm font-medium hover:bg-green-200 transition-colors"
                  >
                    Mark as Done
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}