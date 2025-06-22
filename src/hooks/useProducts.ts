import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Product } from '../types'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
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
  }, [])

  const uploadProductImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${crypto.randomUUID()}.${fileExt}`
      const filePath = `${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('Error uploading image: ', error)
      return null
    }
  }
  
  const deleteProductImage = async (imageUrl: string) => {
    try {
      const imagePath = imageUrl.split('/').pop()
      if (imagePath) {
        await supabase.storage.from('product-images').remove([imagePath])
      }
    } catch (error) {
      console.error('Failed to delete old image, but continuing operation:', error)
    }
  }

  const addProduct = async (
    productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>,
    imageFile?: File | null
  ) => {
    try {
      let imageUrl: string | null | undefined = productData.image_url

      if (imageFile) {
        imageUrl = await uploadProductImage(imageFile);
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
      let imageUrl: string | null | undefined = updates.image_url

      if (imageFile) {
        if (updates.image_url) {
          await deleteProductImage(updates.image_url);
        }
        imageUrl = await uploadProductImage(imageFile);
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

  const deleteProduct = async (id: string, imageUrl?: string) => {
    try {
      if (imageUrl) {
        await deleteProductImage(imageUrl)
      }
      
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
  }, [fetchProducts])

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