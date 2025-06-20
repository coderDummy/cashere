import { useState } from 'react'
import { ShoppingCart, Scan, Plus, Minus, Trash2, CreditCard, ArrowLeft } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import { useOrders } from '../hooks/useOrders'
import { useBarcode } from '../hooks/useBarcode'
import { Product, CartItem, PaymentMethod } from '../types'
import { BarcodeScanner } from './BarcodeScanner'
import { CheckoutModal } from './CheckoutModal'
import {toast} from  'react-hot-toast'

export function POSView() {
  const { products } = useProducts()
  const { createOrder } = useOrders()
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [barcodeMode, setBarcodeMode] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showMobileCart, setShowMobileCart] = useState(false)

  const { isScanning, startScanning, stopScanning } = useBarcode((code) => {
    const product = products.find(p => p.barcode === code)
    if (product) {
      addToCart(product)
    } else {
      toast.error('Product not found for barcode: ' + code);
    }
  })

  const categories = ['all', ...new Set(products.map(p => p.category))]
  
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode?.includes(searchTerm)
    return matchesCategory && matchesSearch
  })

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const addToCart = (product: Product, quantity: number = 1) => {
    if (product.stock < quantity) {
      toast.error('Insufficient stock');
      return
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        const newQuantity = existing.quantity + quantity
        if (newQuantity > product.stock) {
          toast.error('Insufficient stock');
          return prev
        }
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        )
      }
      return [...prev, { product, quantity, notes: '' }]
    })
  }

  const updateCartItem = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    const product = products.find(p => p.id === productId)
    if (product && quantity > product.stock) {
      toast.error('Insufficient stock');
      return
    }

    setCart(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    )
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId))
  }

const handleCheckout = async (paymentMethod: PaymentMethod, tableNumber?: string, notes?: string) => {
    if (cart.length === 0) {
      toast.error("Cart is empty!"); 
      return;
    }

    const orderData = {
      table_number: tableNumber,
      total_amount: cartTotal,
      payment_method: paymentMethod,
      notes,
      items: cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity
        // Harga dan notes item tidak perlu dikirim lagi sesuai diskusi sebelumnya
      }))
    }

    const orderPromise = createOrder(orderData);
    await toast.promise(orderPromise, {
      loading: 'Processing your order...',
      success: 'Order created successfully!',
      error: (err) => `Error: ${err.message}` // Menggunakan err.message agar lebih jelas
    });
    const { error } = await orderPromise;
    if (!error) {
      setCart([]);
      setShowCheckout(false);
      setShowMobileCart(false);
    }
  }

  return (
    <div className="h-full flex flex-col lg:flex-row">
      {/* Products Section */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Point of Sale</h2>
            <div className="flex items-center gap-2">
              {/* Mobile Cart Button */}
              <button
                onClick={() => setShowMobileCart(true)}
                className="lg:hidden relative flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="text-sm">Cart</span>
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setBarcodeMode(!barcodeMode)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  barcodeMode
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Scan className="w-4 h-4" />
                <span className="hidden sm:inline">Barcode</span>
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search products or scan barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? 'All' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Barcode Scanner */}
        {barcodeMode && (
          <div className="bg-white p-4 border-b border-gray-200">
            <BarcodeScanner
              isScanning={isScanning}
              onStartScan={startScanning}
              onStopScan={stopScanning}
            />
          </div>
        )}

        {/* Products Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 lg:gap-4">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white p-3 lg:p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="aspect-square bg-gray-100 rounded-md mb-2 lg:mb-3 flex items-center justify-center">
                  <span className="text-xl lg:text-2xl font-bold text-gray-400">
                    {product.name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-medium text-gray-900 text-xs lg:text-sm mb-1 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-sm lg:text-lg font-bold text-gray-900 mb-1">
                      Rp {new Intl.NumberFormat('id-ID').format(product.price)}
                </p>
                <p className={`text-xs ${product.stock > 10 ? 'text-gray-500' : 'text-red-500'}`}>
                  Stock: {product.stock}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Cart Section */}
      <div className="hidden lg:flex w-80 bg-white border-l border-gray-200 flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-gray-700" />
            <h3 className="font-semibold text-gray-900">Cart ({cart.length})</h3>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Cart is empty</p>
              <p className="text-sm">Add products to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.product.id} className="bg-gray-50 p-3 rounded-md">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {item.product.name}
                    </h4>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateCartItem(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartItem(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="font-medium text-gray-900">
                      Rp {new Intl.NumberFormat('id-ID').format(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-xl font-bold text-gray-900">
                      Rp {new Intl.NumberFormat('id-ID').format(cartTotal)}
              </span>
            </div>
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full bg-gray-900 text-white py-3 rounded-md font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Checkout
            </button>
          </div>
        )}
      </div>

      {/* Mobile Cart Modal */}
      {showMobileCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50 lg:hidden">
          <div className="bg-white rounded-t-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">Cart ({cart.length})</h3>
              <button
                onClick={() => setShowMobileCart(false)}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              {cart.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Cart is empty</p>
                  <p className="text-sm">Add products to get started</p>
                </div>
              ) : (
                <div className="space-y-3 mb-4">
                  {cart.map(item => (
                    <div key={item.product.id} className="bg-gray-50 p-3 rounded-md">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateCartItem(item.product.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartItem(item.product.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="font-medium text-gray-900">
                                           Rp {new Intl.NumberFormat('id-ID').format(item.product.price * item.quantity)}     
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {cart.length > 0 && (
                <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-xl font-bold text-gray-900">
                        Rp {new Intl.NumberFormat('id-ID').format(cartTotal)}     
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setShowMobileCart(false)
                      setShowCheckout(true)
                    }}
                    className="w-full bg-gray-900 text-white py-3 rounded-md font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    Checkout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          cart={cart}
          total={cartTotal}
          onCheckout={handleCheckout}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </div>
  )
}