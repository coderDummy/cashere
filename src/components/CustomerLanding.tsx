import React, { useState } from 'react';
import { Utensils, ShoppingBag, ArrowRight, Fingerprint } from 'lucide-react';
import doughtLogo from '../assets/dought-logo.svg'; // Asumsi Anda punya logo

interface CustomerLandingProps {
  onSelectMode: (mode: 'dine-in' | 'pickup', table?: string) => void;
}

export function CustomerLanding({ onSelectMode }: CustomerLandingProps) {
  const [showDineInInput, setShowDineInInput] = useState(false);
  const [tableNumber, setTableNumber] = useState('');

  const handleDineInClick = () => {
    setShowDineInInput(true);
  };

  const handleGoToMenu = () => {
    if (tableNumber.trim()) {
      onSelectMode('dine-in', tableNumber);
    } else {
      alert("Please enter your table number.");
    }
  };

  const handlePickupClick = () => {
    onSelectMode('pickup');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
      {/* <img src={doughtLogo} alt="Dought Studio Logo" className="w-24 h-24 mb-4" /> */}
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome!</h1>
      <p className="text-lg text-gray-600 mb-8">How would you like to order today?</p>

      <div className="w-full max-w-xs space-y-3">
        {!showDineInInput && (
          <>
            <button 
              onClick={handleDineInClick} 
              className="w-full bg-white text-gray-800 font-semibold py-4 px-6 rounded-xl shadow-md border border-gray-200 flex items-center justify-center gap-3 hover:bg-gray-100 transition-all"
            >
              <Utensils className="w-5 h-5" />
              Dine In
            </button>
            <button 
              onClick={handlePickupClick}
              className="w-full bg-white text-gray-800 font-semibold py-4 px-6 rounded-xl shadow-md border border-gray-200 flex items-center justify-center gap-3 hover:bg-gray-100 transition-all"
            >
              <ShoppingBag className="w-5 h-5" />
              Pickup / Take Away
            </button>
          </>
        )}

        {showDineInInput && (
          <div className="p-4 bg-white rounded-xl shadow-md border border-gray-200 animate-fade-in">
            <label htmlFor="table-number" className="block text-sm font-medium text-gray-700 mb-2">Enter Table Number</label>
            <input 
              type="text"
              id="table-number"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value.toUpperCase())}
              placeholder="e.g., A12"
              className="w-full text-center text-lg font-semibold px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              autoFocus
            />
            <button 
              onClick={handleGoToMenu} 
              className="mt-3 w-full bg-gray-900 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
            >
              Go to Menu
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <div className="absolute bottom-5 right-5">
        <a href="/secure-login" className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
          <Fingerprint className="w-3 h-3"/>
          Staff Access
        </a>
      </div>
    </div>
  );
}