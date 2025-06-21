import React, { useState } from 'react'
import { X, CreditCard, Banknote, Smartphone, Building } from 'lucide-react'
import { CartItem, PaymentMethod } from '../types'
import { CornerDownRight, /* ikon-ikon lain yang sudah ada */ } from 'lucide-react'

interface CheckoutModalProps {
  cart: CartItem[]
  total: number
  onCheckout: (paymentMethod: PaymentMethod, tableNumber?: string, notes?: string) => void
  onClose: () => void
}

export function CheckoutModal({ cart, total, onCheckout, onClose }: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [tableNumber, setTableNumber] = useState('')
  const [notes, setNotes] = useState('')

  const paymentMethods = [
    { id: 'cash' as PaymentMethod, label: 'Cash', icon: Banknote },
    { id: 'qris' as PaymentMethod, label: 'QRIS', icon: Smartphone },
    { id: 'card' as PaymentMethod, label: 'Card', icon: CreditCard },
    { id: 'transfer' as PaymentMethod, label: 'Transfer', icon: Building },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCheckout(paymentMethod, tableNumber || undefined, notes || undefined)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-lg">
          <h3 className="text-lg font-semibold text-gray-900">Checkout</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Order Summary */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Order Summary</h4>
            <div className="bg-gray-50 rounded-md p-3 space-y-3 max-h-48 overflow-y-auto">
              {cart.map(item => (
                <div key={item.product.id}>
                  {/* Baris untuk Nama Produk dan Harga */}
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-800">{item.product.name} x{item.quantity}</span>
                    <span>Rp {new Intl.NumberFormat('id-ID').format(item.product.price * item.quantity)}</span>
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

              {/* Baris untuk Total */}
              <div className="border-t border-gray-200 pt-2 mt-3 flex justify-between text-base font-bold">
                <span>Total</span>
                <span>Rp {new Intl.NumberFormat('id-ID').format(total)}</span>
              </div>
            </div>
          </div>

          {/* Table Number */}
          <div>
            <label htmlFor="tableNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Table Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="tableNumber"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="e.g., B11"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              required
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map(method => {
                const Icon = method.icon
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex items-center gap-2 p-3 rounded-md border transition-colors ${
                      paymentMethod === method.id
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{method.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Special instructions..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Complete Order
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}