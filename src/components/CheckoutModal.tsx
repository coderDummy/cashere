import React, { useState } from 'react';
import { X, CreditCard, Banknote, Smartphone, Building, Utensils, ShoppingBag } from 'lucide-react';
import { CartItem, PaymentMethod, CustomerMode } from '../types';
import { CornerDownRight } from 'lucide-react';

// PERBAIKAN: Menambahkan `mode: CustomerMode` ke dalam definisi onCheckout
interface CheckoutModalProps {
  cart: CartItem[];
  total: number;
  onCheckout: (
    paymentMethod: PaymentMethod,
    mode: CustomerMode,
    tableNumber?: string,
    notes?: string
  ) => void;
  onClose: () => void;
}

export function CheckoutModal({ cart, total, onCheckout, onClose }: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [mode, setMode] = useState<CustomerMode>('dine-in');
  const [tableNumber, setTableNumber] = useState('');
  const [notes, setNotes] = useState('');

  const paymentMethods = [
    { id: 'cash' as PaymentMethod, label: 'Cash', icon: Banknote },
    { id: 'qris' as PaymentMethod, label: 'QRIS', icon: Smartphone },
    { id: 'card' as PaymentMethod, label: 'Card', icon: CreditCard },
    { id: 'transfer' as PaymentMethod, label: 'Transfer', icon: Building },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'dine-in' && !tableNumber.trim()) {
      alert('Please enter a table number for Dine-In orders.');
      return;
    }
    // PERBAIKAN: Sekarang mengirim `mode` saat checkout
    onCheckout(paymentMethod, mode, tableNumber || undefined, notes || undefined);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-lg">
          <h3 className="text-lg font-semibold text-gray-900">Checkout</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-5 h-5" /></button>
        </div>

        {/* Gunakan id unik untuk form agar bisa di-submit dari luar */}
        <form id="checkout-form" onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
          {/* Order Summary */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Order Summary</h4>
            <div className="bg-gray-50 rounded-md p-3 space-y-3 max-h-48 overflow-y-auto">
              {cart.map(item => (
                <div key={item.product.id}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-800">{item.product.name} x{item.quantity}</span>
                    <span>Rp {new Intl.NumberFormat('id-ID').format(item.product.price * item.quantity)}</span>
                  </div>
                  {item.notes && (<div className="flex items-start gap-2 pt-1 pl-2"><CornerDownRight className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" /><p className="text-xs text-gray-600 italic">{item.notes}</p></div>)}
                </div>
              ))}
              <div className="border-t border-gray-200 pt-2 mt-3 flex justify-between text-base font-bold"><span>Total</span><span>Rp {new Intl.NumberFormat('id-ID').format(total)}</span></div>
            </div>
          </div>

          {/* Order Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Order Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setMode('dine-in')} className={`flex items-center justify-center gap-2 p-3 rounded-md border-2 transition-colors ${mode === 'dine-in' ? 'border-gray-900 bg-gray-100' : 'border-gray-300 hover:border-gray-400'}`}><Utensils className="w-4 h-4" />Dine-In</button>
              <button type="button" onClick={() => setMode('take-away')} className={`flex items-center justify-center gap-2 p-3 rounded-md border-2 transition-colors ${mode === 'take-away' ? 'border-gray-900 bg-gray-100' : 'border-gray-300 hover:border-gray-400'}`}><ShoppingBag className="w-4 h-4" />Take Away</button>
            </div>
          </div>

          {/* Table Number (Conditional) */}
          {mode === 'dine-in' && (
            <div className="animate-fade-in">
              <label htmlFor="tableNumber" className="block text-sm font-medium text-gray-700 mb-1">Table Number <span className="text-red-500">*</span></label>
              <input type="text" id="tableNumber" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} placeholder="e.g., B11" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900" required />
            </div>
          )}

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map(method => {
                const Icon = method.icon;
                return (<button key={method.id} type="button" onClick={() => setPaymentMethod(method.id)} className={`flex items-center gap-2 p-3 rounded-md border transition-colors ${paymentMethod === method.id ? 'border-gray-900 bg-gray-50' : 'border-gray-300 hover:border-gray-400'}`}><Icon className="w-4 h-4" /><span className="text-sm font-medium">{method.label}</span></button>);
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Special instructions..." className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
          </div>
        </form>
        
        {/* Actions */}
        <div className="p-4 flex gap-3 sticky bottom-0 bg-white border-t border-gray-200">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">Cancel</button>
            <button type="submit" form="checkout-form" className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800">Complete Order</button>
        </div>
      </div>
    </div>
  );
}