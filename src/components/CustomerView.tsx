import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Send, ArrowLeft, Search, Package } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useOrders } from '../hooks/useOrders';
import { Product, CartItem, Order } from '../types';
import { GuestInfoModal } from './GuestInfoModal';
import { PaymentModal } from './PaymentModal';
import { toast } from 'react-hot-toast';

interface CustomerViewProps {
  tableNumber: string;
}

interface GuestInfo {
  name: string;
  phone: string;
}

export function CustomerView({ tableNumber: tableNumberFromUrl }: CustomerViewProps) {
  const { products, loading, error } = useProducts();
  const { createOrder } = useOrders();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumber] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [showGuestInfoModal, setShowGuestInfoModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guestInfo, setGuestInfo] = useState<GuestInfo | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const storedGuestInfo = localStorage.getItem('dought_studio_guest_info');
    if (storedGuestInfo) {
      setGuestInfo(JSON.parse(storedGuestInfo));
    }
    
    if (tableNumberFromUrl) {
      setTableNumber(tableNumberFromUrl);
    }
  }, [tableNumberFromUrl]);

  const categories = !loading && products ? ['all', ...new Set(products.map(p => p.category))] : ['all'];
  
  const filteredProducts = !loading && products ? products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch && product.stock > 0;
  }) : [];

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        const newQuantity = existing.quantity + 1;
        if (newQuantity > product.stock) {
          toast.error('Not enough stock available');
          return prev;
        }
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: newQuantity } : item);
      }
      return [...prev, { product, quantity: 1, notes: '' }];
    });
    toast.success(`${product.name} added to cart!`);
  };

  const updateCartItem = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.product.id !== productId));
      return;
    }
    const product = products.find(p => p.id === productId);
    if (product && quantity > product.stock) {
      toast.error('Not enough stock available');
      return;
    }
    setCart(prev => prev.map(item => item.product.id === productId ? { ...item, quantity } : item));
  };
  
  const updateItemNotes = (productId: string, notes: string) => {
    setCart(currentCart =>
      currentCart.map(item =>
        item.product.id === productId
          ? { ...item, notes: notes }
          : item
      )
    );
  };

  const handleSubmitOrder = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }
    if (guestInfo) {
      handleConfirmOrder(guestInfo.name, guestInfo.phone);
    } else {
      setShowGuestInfoModal(true);
    }
  };

  const handleConfirmOrder = async (name: string, phoneNumber: string) => {
    setIsSubmitting(true);
    setShowGuestInfoModal(false); // Langsung tutup modal info
    localStorage.setItem('dought_studio_guest_info', JSON.stringify({ name, phone: phoneNumber }));
    setGuestInfo({ name, phone: phoneNumber });

    const orderData = {
      table_number: tableNumber,
      total_amount: cartTotal,
      name,
      phoneNumber,
      items: cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        notes: item.notes,
      })),
    };

    const orderPromise = createOrder(orderData);
    await toast.promise(orderPromise, {
      loading: 'Submitting your order...',
      success: 'Order submitted! Please complete your payment.',
      error: (err) => `Error: ${err.message || 'Failed to submit order.'}`,
    });

    const { data: newOrder, error } = await orderPromise;
    if (!error && newOrder) {
      setCart([]);
      setCompletedOrder(newOrder as Order);
      setShowPaymentModal(true); // Buka modal pembayaran
    }
    setIsSubmitting(false);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setCompletedOrder(null);
    toast.success('Thank you!');
    // Opsi: refresh halaman untuk memulai sesi baru yang bersih.
    // window.location.reload(); 
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <p className="mt-4 text-lg text-gray-600">Loading Menu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center text-red-600 bg-red-50 p-4">
        <p className="font-medium">Error: Failed to load products.</p>
        <p className="text-sm">Please check your connection and refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Menu</h1>
          <button
            onClick={() => setShowCart(true)}
            className="relative flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            {cartItemsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="p-4 max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-base"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-gray-900 text-white shadow'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {category === 'all' ? 'All' : category}
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
           <div className="text-center py-16 text-gray-500">
             <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
             <p className="text-lg font-medium">No Products Found</p>
             <p className="text-sm">There are no products available that match your search or filter.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col">
                <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-gray-400">
                      {product.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                  {product.description && (
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{product.description}</p>
                  )}
                  <div className="flex-grow"></div>
                  <p className="text-lg font-bold text-gray-900 mt-2 mb-3">
                    Rp {new Intl.NumberFormat('id-ID').format(product.price)}
                  </p>
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full mt-auto bg-gray-900 text-white py-2.5 rounded-lg hover:bg-gray-800 flex items-center justify-center gap-2 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white rounded-t-xl sm:rounded-xl w-full max-w-md max-h-full sm:max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-lg font-semibold">Your Order</h3>
              <button onClick={() => setShowCart(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Table Number</label>
                <div className="w-full px-3 py-3 bg-gray-100 border border-gray-200 rounded-lg text-base font-medium text-gray-800">
                  {tableNumber}
                </div>
              </div>
              {cart.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.product.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">{item.product.name}</h4>
                        <span className="font-semibold text-gray-900 text-sm">
                          Rp {new Intl.NumberFormat('id-ID').format(item.product.price * item.quantity)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button onClick={() => updateCartItem(item.product.id, item.quantity - 1)} className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center">
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button onClick={() => updateCartItem(item.product.id, item.quantity + 1)} className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                       <input
                        type="text"
                        placeholder="Add note... (e.g., no spicy)"
                        value={item.notes || ''}
                        onChange={(e) => updateItemNotes(item.product.id, e.target.value)}
                        className="w-full text-xs p-2 mt-3 border border-gray-200 rounded-md focus:ring-1 focus:ring-gray-900"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            {cart.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-white sticky bottom-0">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-xl font-bold">
                    Rp {new Intl.NumberFormat('id-ID').format(cartTotal)}
                  </span>
                </div>
                <button
                  onClick={handleSubmitOrder}
                  className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Submit Order
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showGuestInfoModal && (
        <GuestInfoModal
          onClose={() => setShowGuestInfoModal(false)}
          onConfirm={handleConfirmOrder}
        />
      )}
      
      {showPaymentModal && completedOrder && (
        <PaymentModal
          order={completedOrder}
          onClose={handleClosePaymentModal}
        />
      )}
    </div>
  );
}