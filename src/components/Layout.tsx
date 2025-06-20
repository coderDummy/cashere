import React from 'react'
import { User, LogOut, ShoppingCart, Package, BarChart3, Menu, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'

interface LayoutProps {
  children: React.ReactNode
  currentView: string
  onViewChange: (view: string) => void
}

export function Layout({ children, currentView, onViewChange }: LayoutProps) {
  const { user, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    { id: 'pos', label: 'POS', icon: ShoppingCart },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  ]

  const handleSignOut = async () => {
    await signOut()
  }

  const handleViewChange = (view: string) => {
    onViewChange(view)
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            )}
            <h1 className="text-lg lg:text-xl font-bold text-gray-900">Dought Studio</h1>
          </div>
          
          {user && (
            <div className="flex items-center gap-2 lg:gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span className="hidden md:inline">{user.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-2 lg:px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex relative">
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && user && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        {user && (
          <nav className={`
            fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
            w-64 bg-white border-r border-gray-200 
            transform transition-transform duration-300 ease-in-out lg:transform-none
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            min-h-[calc(100vh-73px)] mt-[73px] lg:mt-0
          `}>
            <div className="p-4">
              <ul className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => handleViewChange(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-3 lg:py-2 text-sm font-medium rounded-md transition-colors ${
                          currentView === item.id
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </nav>
        )}

        {/* Main Content */}
        <main className={`flex-1 ${user ? 'p-4 lg:p-6' : ''}`} style={{ width: '100%' }}>
          {children}
        </main>
      </div>
    </div>
  )
}