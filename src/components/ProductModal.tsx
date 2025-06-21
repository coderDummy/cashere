import React, { useState, useEffect } from 'react';
import { X, Image } from 'lucide-react';
import { Product } from '../types';
import { toast } from 'react-hot-toast';

interface ProductModalProps {
  product: Product | null;
  onSave: (
    data: Omit<Product, 'id' | 'created_at' | 'updated_at'>,
    imageFile?: File | null
  ) => Promise<{ error: any }>;
  onClose: () => void;
}

export function ProductModal({ product, onSave, onClose }: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    barcode: '',
    description: '',
    image_url: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price.toString(),
        stock: product.stock.toString(),
        category: product.category,
        barcode: product.barcode || '',
        description: product.description || '',
        image_url: product.image_url || '',
      });
      setImagePreview(product.image_url || null);
    }
  }, [product]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Batas 2MB
        toast.error("Image size cannot exceed 2MB.");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.stock || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    
    const { image_url, ...dataToSave } = formData;
    
    const { error } = await onSave(
      {
        ...dataToSave,
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock, 10) || 0,
        barcode: formData.barcode || undefined,
        description: formData.description || undefined,
        image_url: product?.image_url, // Kirim URL lama untuk perbandingan di hook
      },
      imageFile
    );
    
    setIsSaving(false);

    if (!error) {
      toast.success(`Product ${product ? 'updated' : 'added'} successfully!`);
      onClose();
    } else {
      toast.error(`Failed to ${product ? 'update' : 'add'} product.`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">{product ? 'Edit Product' : 'Add Product'}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
            <div className="mt-1 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-24 h-24 rounded-md bg-gray-100 flex-shrink-0 flex items-center justify-center border">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-md" />
                ) : (
                  <Image className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <input type="file" accept="image/png, image/jpeg" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-800 hover:file:bg-gray-200 cursor-pointer"/>
            </div>
          </div>
          
          {/* Product Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"/>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Product details..." className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 resize-y"/>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
              <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} step="1" min="0" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"/>
            </div>
            {/* Stock */}
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
              <input type="number" id="stock" name="stock" value={formData.stock} onChange={handleChange} step="1" min="0" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"/>
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <input type="text" id="category" name="category" value={formData.category} onChange={handleChange} required placeholder="e.g., Food, Drinks, Snacks" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"/>
          </div>

          {/* Barcode */}
          <div>
            <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-1">Barcode (Optional)</label>
            <input type="text" id="barcode" name="barcode" value={formData.barcode} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"/>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isSaving} className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-md font-semibold hover:bg-gray-800 disabled:opacity-50">
              {isSaving ? 'Saving...' : (product ? 'Update' : 'Add') + ' Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}