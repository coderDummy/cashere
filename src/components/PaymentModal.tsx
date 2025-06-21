import React, { useState } from 'react';
import { X, QrCode, CreditCard, Banknote, Building } from 'lucide-react';
import { Order } from '../types';
import qrisImage from '../assets/qris.png'; // Import gambar QR

interface PaymentModalProps {
  order: Order;
  onClose: () => void;
}

type PaymentOption = 'qris' | 'cash' | 'card';

export function PaymentModal({ order, onClose }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentOption | null>(null);

  const paymentMethods: { id: PaymentOption; label: string; icon: React.ElementType }[] = [
    { id: 'qris', label: 'QRIS', icon: QrCode },
    { id: 'cash', label: 'Cash', icon: Banknote },
    { id: 'card', label: 'Card', icon: CreditCard },
  ];

  const renderPaymentDetails = () => {
    switch (selectedMethod) {
      case 'qris':
        return (
          <div className="text-center p-4 bg-gray-50 rounded-lg animate-fade-in">
            <h4 className="font-medium text-gray-800">Scan to Pay</h4>
            <p className="text-xs text-gray-500 mb-3">Powered by DANA</p>
            <img src={qrisImage} alt="QRIS Payment Code" className="w-64 h-64 mx-auto rounded-md shadow-md" />
            <div className="mt-4 text-sm bg-blue-50 text-blue-800 p-3 rounded-lg">
              <p className="font-semibold">Total: Rp {order.total_amount.toLocaleString('id-ID')}</p>
              <p>Order ID: #{order.id.slice(-6).toUpperCase()}</p>
            </div>
          </div>
        );
      case 'cash':
      case 'card':
        return (
          <div className="text-center p-6 bg-green-50 text-green-800 rounded-lg animate-fade-in">
            <h4 className="font-semibold text-lg mb-2">Please Pay at the Cashier</h4>
            <p>Show your order details to the cashier to complete the payment.</p>
            <div className="mt-4 font-mono bg-white p-3 rounded-md border border-green-200">
              <p>Order ID: <span className="font-bold">#{order.id.slice(-6).toUpperCase()}</span></p>
              <p>Total: <span className="font-bold">Rp {order.total_amount.toLocaleString('id-ID')}</span></p>
            </div>
          </div>
        );
      default:
        return <p className="text-center text-gray-500 py-8">Please select a payment method.</p>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-xl max-w-md w-full shadow-lg">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Complete Your Payment</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {paymentMethods.map(method => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedMethod(method.id)}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      selectedMethod === method.id
                        ? 'border-gray-900 bg-gray-100'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-sm font-medium">{method.label}</span>
                  </button>
                );
              })}
              {/* Tombol Transfer Disabled */}
              <button
                disabled
                className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
              >
                <Building className="w-6 h-6" />
                <span className="text-sm font-medium">Transfer</span>
              </button>
            </div>
          </div>
          
          <div className="pt-2">
            {renderPaymentDetails()}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800"
            >
              Done
            </button>
        </div>
      </div>
    </div>
  );
}