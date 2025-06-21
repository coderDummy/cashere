import React, { useState } from 'react';
import { X, User, Phone, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface GuestInfoModalProps {
  onClose: () => void;
  onConfirm: (name: string, phone: string) => void;
}

type ModalStep = 'enter_phone' | 'enter_name' | 'loading';

export function GuestInfoModal({ onClose, onConfirm }: GuestInfoModalProps) {
  const [step, setStep] = useState<ModalStep>('enter_phone');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneSubmit = async () => {
    if (!/^[0-9\+]{8,}$/.test(phone.trim())) {
      toast.error('Please enter a valid phone number.');
      return;
    }
    
    setIsLoading(true);

    const { data, error } = await supabase
      .from('users')
      .select('name')
      .eq('phone_number', phone)
      .single();
    
    setIsLoading(false);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = row not found, itu bukan error
      toast.error('An error occurred. Please try again.');
      setStep('enter_phone');
      return;
    }

    if (data?.name) {
      onConfirm(data.name, phone);
    } else {
      setStep('enter_name');
    }
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter your name.');
      return;
    }
    onConfirm(name, phone);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="p-8 h-48 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    switch (step) {
      case 'enter_name':
        return (
          <form onSubmit={handleFinalSubmit} className="p-4 space-y-4">
            <p className="text-sm text-center text-gray-600">
              Welcome! Please enter your name to continue.
            </p>
            <div>
              <label htmlFor="guest-name" className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" id="guest-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900" autoFocus />
              </div>
            </div>
            <div className="pt-2">
              <button type="submit" className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800">
                Confirm & Submit Order
              </button>
            </div>
          </form>
        );

      case 'enter_phone':
      default:
        return (
          <form onSubmit={(e) => { e.preventDefault(); handlePhoneSubmit(); }} className="p-4 space-y-4">
             <p className="text-sm text-center text-gray-600">
              Please enter your phone number to proceed.
            </p>
            <div>
              <label htmlFor="guest-phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="tel" id="guest-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g., 08123456789" required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900" autoFocus />
              </div>
            </div>
            <div className="pt-2">
              <button type="submit" className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 flex items-center justify-center gap-2">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-xl max-w-sm w-full shadow-lg">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Guest Information</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
}