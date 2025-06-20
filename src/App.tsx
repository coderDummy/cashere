import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { Layout } from './components/Layout'
import { LoginForm } from './components/LoginForm'
import { POSView } from './components/POSView'
import { OrdersView } from './components/OrdersView'
import { ProductsView } from './components/ProductsView'
import { DashboardView } from './components/DashboardView'
import { CustomerView } from './components/CustomerView'
import { Toaster } from 'react-hot-toast' // <-- Pastikan ini sudah di-import

function App() {
  const { user, loading } = useAuth()
  const [currentView, setCurrentView] = useState('pos')
  const [isCustomerMode, setIsCustomerMode] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Customer mode (no authentication required)
  if (isCustomerMode) {
    return <CustomerView />
  }

  // Admin mode (authentication required)
  if (!user) {
    return (
      // Toaster ditambahkan di sini untuk halaman login
      <>
        <Toaster position="top-center" />
        <div>
          <LoginForm />
          <div className="fixed bottom-4 right-4">
            <button
              onClick={() => setIsCustomerMode(true)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
            >
              Browse as Customer
            </button>
          </div>
        </div>
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
    // Toaster ditambahkan di sini untuk layout utama setelah login
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Layout currentView={currentView} onViewChange={setCurrentView}>
        {renderCurrentView()}
      </Layout>
    </>
  )
}

export default App