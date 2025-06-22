import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useCustomerSession } from './hooks/useCustomerSession';
import { Layout } from './components/Layout';
import { LoginForm } from './components/LoginForm';
import { POSView } from './components/POSView';
import { OrdersView } from './components/OrdersView';
import { ProductsView } from './components/ProductsView';
import { DashboardView } from './components/DashboardView';
import { CustomerView } from './components/CustomerView';
import { ModeSelectionView } from './components/ModeSelectionView';
import { Toaster } from 'react-hot-toast';

function App() {
  const { user, loading: authLoading } = useAuth();
  const { session: customerSession, isSessionActive } = useCustomerSession();
  const [currentView, setCurrentView] = useState('pos');
  const [tableNumberFromUrl, setTableNumberFromUrl] = useState<string | null>(null);
  const [activeComponent, setActiveComponent] = useState<'loading' | 'admin' | 'customer' | 'selection' | 'login'>('loading');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tableParam = params.get('t');
    if (tableParam) {
      setTableNumberFromUrl(tableParam);
      setActiveComponent('customer');
      return; 
    }

    if (user) {
      setActiveComponent('admin');
    } else if (window.location.pathname === '/login') {
      setActiveComponent('login');
    } else if (isSessionActive) {
      setActiveComponent('customer');
    } else {
      setActiveComponent('selection');
    }
  }, [user, isSessionActive]);

  const renderContent = () => {
    if (authLoading || activeComponent === 'loading') {
      return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>;
    }

    switch (activeComponent) {
      case 'admin':
        let viewComponent;
        switch (currentView) {
          case 'orders': viewComponent = <OrdersView />; break;
          case 'products': viewComponent = <ProductsView />; break;
          case 'dashboard': viewComponent = <DashboardView />; break;
          case 'pos': default: viewComponent = <POSView />; break;
        }
        return <Layout currentView={currentView} onViewChange={setCurrentView}>{viewComponent}</Layout>;
      
      case 'login':
        return <LoginForm />;

      case 'customer':
        const tableForCustomer = tableNumberFromUrl || customerSession?.tableNumber || null;
        return <CustomerView tableNumberFromUrl={tableForCustomer} />;

      case 'selection':
      default:
        return <ModeSelectionView />;
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      {renderContent()}
    </>
  );
}

export default App;