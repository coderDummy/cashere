import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { Layout } from './components/Layout';
import { LoginForm } from './components/LoginForm';
import { POSView } from './components/POSView';
import { OrdersView } from './components/OrdersView';
import { ProductsView } from './components/ProductsView';
import { DashboardView } from './components/DashboardView';
import { CustomerView } from './components/CustomerView';
import { CustomerLanding } from './components/CustomerLanding';
import { Toaster } from 'react-hot-toast';
import { UserRole } from './types';

function App() {
  const { authUser, profile, loading } = useAuth();
  const [currentView, setCurrentView] = useState('pos');
  const [guestMode, setGuestMode] = useState<'dine-in' | 'pickup' | null>(null);
  const [guestTableNumber, setGuestTableNumber] = useState<string | undefined>(undefined);

  // useEffect untuk menangani alur tamu (guest) dari URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tableNumFromUrl = params.get('t');

    if (tableNumFromUrl) {
      setGuestMode(tableNumFromUrl === 'pickup' ? 'pickup' : 'dine-in');
      setGuestTableNumber(tableNumFromUrl);
    }
  }, []);

  // PERBAIKAN DI SINI: useEffect baru untuk menangani perubahan view berdasarkan peran
  useEffect(() => {
    if (authUser && profile) {
      const userRole = profile.role;
      const allowedViews: Record<UserRole, string[]> = {
        admin: ['pos', 'orders', 'products', 'dashboard'],
        cashier: ['pos', 'orders', 'products'],
        kitchen: ['orders'],
        guest: [],
      };
      
      // Cek apakah view saat ini diizinkan untuk peran pengguna
      if (!allowedViews[userRole] || !allowedViews[userRole].includes(currentView)) {
        // Jika tidak, atur ke view default untuk peran tersebut
        const defaultView = allowedViews[userRole]?.[0] || 'pos';
        setCurrentView(defaultView);
      }
    }
  }, [profile, currentView]); // Dijalankan hanya saat profil atau view berubah

  const handleSelectMode = (mode: 'dine-in' | 'pickup', table?: string) => {
    setGuestMode(mode);
    setGuestTableNumber(table);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Alur untuk halaman login rahasia admin
  if (window.location.pathname === '/secure-login') {
    if (authUser && profile) {
      window.location.href = '/';
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p>Login successful, redirecting...</p>
        </div>
      );
    }
    return (
      <>
        <Toaster position="top-center" />
        <LoginForm />
      </>
    );
  }

  // Alur untuk tamu yang sudah memilih mode
  if (guestMode) {
    return (
      <>
        <Toaster position="top-center" />
        <CustomerView tableNumber={guestTableNumber} />
      </>
    );
  }

  // Alur untuk admin/staf yang sudah login
  if (authUser && profile) {
    const renderCurrentView = () => {
      switch (currentView) {
        case 'pos': return <POSView />;
        case 'orders': return <OrdersView />;
        case 'products': return <ProductsView />;
        case 'dashboard': return <DashboardView />;
        default: return <POSView />; // Fallback ke POS
      }
    };
    
    return (
      <>
        <Toaster position="top-center" reverseOrder={false} />
        <Layout 
          currentView={currentView} 
          onViewChange={setCurrentView}
        >
          {renderCurrentView()}
        </Layout>
      </>
    );
  }

  // Halaman default untuk pengunjung umum
  return (
    <>
      <Toaster position="top-center" />
      <CustomerLanding onSelectMode={handleSelectMode} />
    </>
  );
}

export default App;