import { useState } from 'react'
import { ShoppingCart, Scan, Plus, Minus, Trash2, CreditCard, ArrowLeft, CornerDownRight } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import { useOrders } from '../hooks/useOrders'
import { useBarcode } from '../hooks/useBarcode'
import { Product, CartItem, PaymentMethod } from '../types'
import { BarcodeScanner } from './BarcodeScanner'
import { CheckoutModal } from './CheckoutModal'
import { toast } from 'react-hot-toast'

export function POSView() {
  const { products, loading, error } = useProducts()
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
  
  const updateItemNotes = (productId: string, notes: string) => {
    setCart(currentCart =>
      currentCart.map(item =>
        item.product.id === productId
          ? { ...item, notes: notes }
          : item
      )
    );
  };

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
        quantity: item.quantity,
        notes: item.notes,
      }))
    }

    const orderPromise = createOrder(orderData);
    await toast.promise(orderPromise, {
      loading: 'Processing your order...',
      success: 'Order created successfully!',
      error: (err) => `Error: ${err.message}`
    });
    const { error } = await orderPromise;
    if (!error) {
      setCart([]);
      setShowCheckout(false);
      setShowMobileCart(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        <p>Error loading products: {error}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row">
      {/* Products Section */}
      <div className="flex-1 flex flex-col">
        {/* ... (Header, Search, Categories, Barcode Scanner, Products Grid tidak berubah) ... */}
      </div>

      {/* ========================================================== */}
      {/* === PERUBAHAN DI DESKTOP CART SECTION ==================== */}
      {/* ========================================================== */}
      <div className="hidden lg:flex w-80 bg-white border-l border-gray-200 flex-col relative"> {/* 1. Tambah `relative` */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-gray-700" />
            <h3 className="font-semibold text-gray-900">Cart ({cart.length})</h3>
          </div>
        </div>
        
        {/* 2. Tambahkan `pb-40` (padding-bottom) agar item terakhir tidak tertutup */}
        <div className="flex-1 overflow-y-auto p-4 pb-40">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Cart is empty</p>
              <p className="text-sm">Add products to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.product.id} className="bg-gray-50 p-3 rounded-md">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm leading-tight">
                      {item.product.name}
                    </h4>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-500 hover:text-red-700 p-1 -mr-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateCartItem(item.product.id, item.quantity - 1)} className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button onClick={() => updateCartItem(item.product.id, item.quantity + 1)} className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="font-medium text-gray-900 text-sm">
                      Rp {new Intl.NumberFormat('id-ID').format(item.product.price * item.quantity)}
                    </span>
                  </div>

                  <input
                    type="text"
                    placeholder="Add note..."
                    value={item.notes || ''}
                    onChange={(e) => updateItemNotes(item.product.id, e.target.value)}
                    className="w-full text-xs p-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-gray-900"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* 3. Bagian ini diubah menjadi `absolute` agar posisinya fixed di bawah */}
        {cart.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-xl font-bold text-gray-900">
                Rp {new Intl.NumberFormat('id-ID').format(cartTotal)}
              </span>
            </div>
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full bg-gray-900 text-white py-3 rounded-md font-medium hover:bg-gray-800 flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Checkout
            </button>
          </div>
        )}
      </div>

      {/* Mobile Cart Modal (tidak ada perubahan) */}
      {showMobileCart && (
          //...
      )}

      {/* Checkout Modal (tidak ada perubahan) */}
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