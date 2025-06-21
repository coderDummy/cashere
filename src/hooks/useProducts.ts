import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Product } from '../types'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name')

      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  // Fungsi helper untuk upload gambar
  const uploadProductImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from('product-images') // Pastikan nama bucket ini sesuai
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('Error uploading image: ', error)
      return null
    }
  }

  const addProduct = async (
    productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>,
    imageFile?: File | null
  ) => {
    try {
      let imageUrl = productData.image_url; // Default ke URL yang sudah ada (jika ada)

      if (imageFile) {
        const publicUrl = await uploadProductImage(imageFile);
        if (publicUrl) {
          imageUrl = publicUrl;
        }
      }

      const { data, error } = await supabase
        .from('products')
        .insert([{ ...productData, image_url: imageUrl }])
        .select()
        .single()

      if (error) throw error
      setProducts(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      return { data, error: null }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to add product'
      return { data: null, error }
    }
  }

  const updateProduct = async (
    id: string,
    updates: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>,
    imageFile?: File | null
  ) => {
    try {
      let imageUrl = updates.image_url;

      if (imageFile) {
        // TODO: Hapus gambar lama dari storage jika ada untuk menghemat ruang
        const publicUrl = await uploadProductImage(imageFile);
        if (publicUrl) {
          imageUrl = publicUrl;
        }
      }

      const { data, error } = await supabase
        .from('products')
        .update({ ...updates, image_url: imageUrl, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setProducts(prev => prev.map(p => p.id === id ? data : p))
      return { data, error: null }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to update product'
      return { data: null, error }
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      // TODO: Hapus juga gambar dari Supabase Storage saat produk dihapus
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error
      setProducts(prev => prev.filter(p => p.id !== id))
      return { error: null }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to delete product'
      return { error }
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts,
  }
}