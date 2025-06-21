import { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import { Layout } from './components/Layout'
import { LoginForm } from './components/LoginForm'
import { POSView } from './components/POSView'
import { OrdersView } from './components/OrdersView'
import { ProductsView } from './components/ProductsView'
import { DashboardView } from './components/DashboardView'
import { CustomerView } from './components/CustomerView'
import { Toaster } from 'react-hot-toast'

function App() {
  const { user, loading } = useAuth()
  const [currentView, setCurrentView] = useState('pos')
  
  const [guestTableNumber, setGuestTableNumber] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // UBAH DI SINI: dari 'table_number' menjadi 't'
    const tableNumFromUrl = params.get('t');

    if (tableNumFromUrl) {
      localStorage.setItem('dought_studio_table_number', tableNumFromUrl);
      setGuestTableNumber(tableNumFromUrl);
    } else {
      const tableNumFromStorage = localStorage.getItem('dought_studio_table_number');
      if (tableNumFromStorage) {
        setGuestTableNumber(tableNumFromStorage);
      }
    }
  }, []);

  if (loading && !guestTableNumber) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (guestTableNumber) {
    return (
      <>
        <Toaster position="top-center" reverseOrder={false} />
        <CustomerView tableNumber={guestTableNumber} />
      </>
    )
  }

  if (!user) {
    return (
      <>
        <Toaster position="top-center" />
        <LoginForm />
      </>
    )
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'pos':
        return <POSView />
      case 'orders':
        return <OrdersView />
      case 'products':
        return <ProductsView />
      case 'dashboard':
        return <DashboardView />
      default:
        return <POSView />
    }
  }

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Layout currentView={currentView} onViewChange={setCurrentView}>
        {renderCurrentView()}
      </Layout>
    </>
  )
}

export default App