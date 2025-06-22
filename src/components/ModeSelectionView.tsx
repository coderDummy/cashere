import React, { useState, useEffect } from 'react';
import { Phone, User, Key, ArrowRight, LogIn } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useCustomerSession } from '../hooks/useCustomerSession';
import { CustomerMode } from '../types';

type Step = 'mode' | 'phone' | 'name' | 'table' | 'loading';

export function ModeSelectionView() {
  const { updateSession } = useCustomerSession();
  const [step, setStep] = useState<Step>('mode');
  const [mode, setMode] = useState<CustomerMode | null>(null);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [tableNumber, setTableNumber] = useState('');

  useEffect(() => {
    const storedTable = sessionStorage.getItem('dought_studio_table_number');
    if (storedTable) {
      setTableNumber(storedTable);
    }
  }, []);

  const handleModeSelect = (selectedMode: CustomerMode) => {
    setMode(selectedMode);
    setStep('phone');
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.trim().length < 8) {
      toast.error('Please enter a valid phone number.');
      return;
    }
    
    setStep('loading');
    try {
      const { data, error } = await supabase
        .from('users')
        .select('name')
        .eq('phone_number', phone)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(error.message);
      }
      
      if (data) {
        setName(data.name);
        if (mode === 'dine-in') {
          setStep('table');
        } else {
          updateSession({ name: data.name, phone, mode, tableNumber: null });
          window.location.reload();
        }
      } else {
        setStep('name');
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred. Please try again.");
      setStep('phone');
    }
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter your name.');
      return;
    }
    if (mode === 'dine-in') {
      setStep('table');
    } else {
      updateSession({ name, phone, mode, tableNumber: null });
      window.location.reload();
    }
  };
  
  const handleTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumber.trim()) {
      toast.error('Please enter your table number.');
      return;
    }
    sessionStorage.setItem('dought_studio_table_number', tableNumber);
    updateSession({ name, phone, mode, tableNumber });
    window.location.reload();
  };

  const renderStep = () => {
    switch (step) {
      case 'loading':
        return <div className="p-8 h-48 flex justify-center items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>;
      case 'phone':
        return (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <h3 className="font-semibold text-lg text-center">Enter Phone Number</h3>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g., 08123..." required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" autoFocus />
            </div>
            <button type="submit" className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2">Continue <ArrowRight className="w-4 h-4" /></button>
          </form>
        );
      case 'name':
        return (
          <form onSubmit={handleNameSubmit} className="space-y-4 animate-fade-in">
            <h3 className="font-semibold text-lg text-center">Welcome! What's your name?</h3>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" autoFocus />
            </div>
            <button type="submit" className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2">
              {mode === 'dine-in' ? 'Next' : 'Start Ordering'}
              {mode === 'dine-in' && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        );
      case 'table':
        return (
          <form onSubmit={handleTableSubmit} className="space-y-4 animate-fade-in">
             <h3 className="font-semibold text-lg text-center">Enter Table Number</h3>
             <div className="relative">
               <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               <input type="text" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} placeholder="e.g., B11" required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" autoFocus />
             </div>
             <button type="submit" className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium">Start Ordering</button>
          </form>
        );
      case 'mode':
      default:
        return (
          <div className="space-y-4">
            <button onClick={() => handleModeSelect('dine-in')} className="w-full text-left p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-semibold text-lg">Dine-In</h3>
              <p className="text-sm text-gray-600">Order from your table.</p>
            </button>
            <button onClick={() => handleModeSelect('take-away')} className="w-full text-left p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-semibold text-lg">Pickup / Take Away</h3>
              <p className="text-sm text-gray-600">Order ahead and pick up.</p>
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Dought Studio</h1>
        <p className="text-lg text-gray-600">How would you like to order today?</p>
      </div>
      <div className="max-w-sm w-full bg-white p-6 rounded-xl shadow-md">
        {renderStep()}
      </div>
      <a href="/login" className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900">
        <LogIn className="w-4 h-4" /> Are you staff? Login here.
      </a>
    </div>
  );
}