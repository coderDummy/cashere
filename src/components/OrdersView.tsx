import { useState } from 'react';
import { CheckCircle, XCircle, Play, Package, User, Utensils, ShoppingBag, Wallet, Check, Bell } from 'lucide-react';
import { useOrders } from '../hooks/useOrders';
import { Order, OrderStatus } from '../types';
import { CornerDownRight } from 'lucide-react';

// ===================== FUNGSI BARU DI SINI =====================
const getStatusText = (order: Order): string => {
  if (order.status === 'ready_to_serve') {
    return order.customer_mode === 'dine-in' ? 'Ready to Serve' : 'Ready to Pickup';
  }
  return order.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};
// =============================================================

export function OrdersView() {
  const { orders, updateOrderStatus, loading } = useOrders();
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  const filteredOrders = orders.filter(order => 
    filter === 'all' || order.status === filter
  );

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'waiting_payment': return <Wallet className="w-4 h-4 text-orange-500" />;
      case 'paid': return <Check className="w-4 h-4 text-cyan-500" />;
      case 'in_progress': return <Play className="w-4 h-4 text-blue-500" />;
      case 'ready_to_serve': return <Bell className="w-4 h-4 text-purple-500" />;
      case 'done': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'waiting_payment': return 'bg-orange-100 text-orange-800';
      case 'paid': return 'bg-cyan-100 text-cyan-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'ready_to_serve': return 'bg-purple-100 text-purple-800';
      case 'done': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus);
  };

  const filterOptions: { value: OrderStatus | 'all', label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'waiting_payment', label: 'Waiting Payment' },
    { value: 'paid', label: 'Paid' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'ready_to_serve', label: 'Ready to Serve' },
    { value: 'done', label: 'Done' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Orders</h2>
        <div className="hidden lg:flex gap-2 overflow-x-auto pb-2">
          {filterOptions.map(option => (
            <button key={option.value} onClick={() => setFilter(option.value)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${filter === option.value ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 lg:space-y-4">
        {loading && <div className="text-center py-12"><p>Loading orders...</p></div>}
        {!loading && filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500">Orders that match the filter will appear here.</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-1">
                    <h3 className="font-semibold text-gray-900">Order #{order.id.slice(-8)}</h3>
                    {order.customer_mode && (<span className={`capitalize flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${order.customer_mode === 'dine-in' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'}`}>{order.customer_mode === 'dine-in' ? <Utensils className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}{order.customer_mode.replace('-', ' ')}</span>)}
                    {order.table_number && (<span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">Table {order.table_number}</span>)}
                    {order.customer_mode === 'take-away' && order.users?.name && (<span className="flex items-center gap-1.5 text-xs text-gray-600"><User className="w-3.5 h-3.5" />{order.users.name}</span>)}
                  </div>
                  <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                </div>
                <div className="flex items-center justify-between w-full sm:w-auto sm:flex-col sm:items-end gap-3">
                   {/* PERUBAHAN DI SINI: Menggunakan getStatusText */}
                  <span className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {getStatusText(order)}
                  </span>
                  <span className="font-bold text-lg text-gray-900">Rp {new Intl.NumberFormat('id-ID').format(order.total_amount)}</span>
                </div>
              </div>

              {order.order_items && order.order_items.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 text-sm mb-2">Items:</h4>
                  <div className="space-y-3 border-l-2 border-gray-100 pl-4">{order.order_items.map(item => (<div key={item.id}><div className="flex justify-between text-sm"><span className="font-medium text-gray-800">{item.product?.name} x {item.qty}</span><span className="font-semibold text-gray-700">Rp {( (item.product?.price ?? 0) * item.qty).toLocaleString('id-ID')}</span></div>{item.notes && (<div className="flex items-start gap-2 pt-1"><CornerDownRight className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" /><p className="text-xs text-gray-600 italic">{item.notes}</p></div>)}</div>))}</div>
                </div>
              )}

              {order.notes && (<div className="mb-4"><h4 className="font-medium text-gray-900 text-sm mb-1">Notes:</h4><p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md">{order.notes}</p></div>)}
              
              <div className="flex flex-wrap gap-2">
                {order.status === 'waiting_payment' && (<><button onClick={() => handleStatusChange(order.id, 'paid')} className="px-3 py-1.5 bg-cyan-100 text-cyan-700 rounded-md text-sm font-medium hover:bg-cyan-200 transition-colors">Confirm Payment</button><button onClick={() => handleStatusChange(order.id, 'cancelled')} className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md text-sm font-medium hover:bg-red-200">Cancel</button></>)}
                {order.status === 'paid' && (<><button onClick={() => handleStatusChange(order.id, 'in_progress')} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-200">Start Preparing</button><button onClick={() => handleStatusChange(order.id, 'cancelled')} className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md text-sm font-medium hover:bg-red-200">Cancel</button></>)}
                {order.status === 'in_progress' && (<button onClick={() => handleStatusChange(order.id, 'ready_to_serve')} className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-md text-sm font-medium hover:bg-purple-200">Mark as Ready</button>)}
                {order.status === 'ready_to_serve' && (<button onClick={() => handleStatusChange(order.id, 'done')} className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md text-sm font-medium hover:bg-green-200">Complete Order</button>)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}