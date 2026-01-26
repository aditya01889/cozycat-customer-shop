'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/Toast/ToastProvider'
import { supabase } from '@/lib/supabase/client'
import { getOperationsUserClient } from '@/lib/middleware/operations-client'
import dynamic from 'next/dynamic'

// Dynamically import components for better code splitting
const InventoryHeader = dynamic(() => import('@/components/operations/InventoryHeader'), {
  loading: () => (
    <div className="animate-pulse bg-gray-200 h-32 rounded-lg mb-6"></div>
  )
})

const IngredientCard = dynamic(() => import('@/components/operations/IngredientCard'), {
  loading: () => (
    <div className="animate-pulse bg-gray-200 h-48 rounded-lg mb-4"></div>
  )
})

const VendorCard = dynamic(() => import('@/components/operations/VendorCard'), {
  loading: () => (
    <div className="animate-pulse bg-gray-200 h-40 rounded-lg mb-4"></div>
  )
})

// Types
interface Ingredient {
  id: string
  name: string
  current_stock: number
  unit: string
  reorder_level: number
  unit_cost: number
  supplier: string | null
  last_updated: string
  material_type?: 'ingredient' | 'packaging' | 'label'
}

interface Vendor {
  id: string
  name: string
  contact_person: string | null
  phone: string | null
  email: string | null
  address: string | null
  is_active: boolean
  payment_terms: string | null
  created_at: string
  last_order_date: string | null
}

export default function InventoryOptimized() {
  const { user } = useAuth()
  const { showSuccess, showError, showWarning, showInfo } = useToast()
  
  // State management
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'ingredients' | 'vendors'>('ingredients')
  const [operationsUser, setOperationsUser] = useState<any>(null)

  // Initialize operations user
  useEffect(() => {
    const initOperationsUser = async () => {
      try {
        const opsUser = await getOperationsUserClient()
        setOperationsUser(opsUser)
      } catch (error) {
        console.error('Failed to initialize operations user:', error)
        showError('Failed to initialize operations access')
      }
    }
    initOperationsUser()
  }, [showError])

  // Fetch inventory data
  const fetchInventoryData = async () => {
    if (!operationsUser) return

    setLoading(true)
    try {
      // Fetch ingredients
      const { data: ingredientsData, error: ingredientsError } = await supabase
        .from('ingredients')
        .select('*')
        .order('name')

      if (ingredientsError) {
        console.error('Error fetching ingredients:', ingredientsError)
        showError('Failed to fetch ingredients')
      } else {
        setIngredients(ingredientsData || [])
      }

      // Fetch vendors
      const { data: vendorsData, error: vendorsError } = await supabase
        .from('vendors')
        .select('*')
        .order('name')

      if (vendorsError) {
        console.error('Error fetching vendors:', vendorsError)
        showError('Failed to fetch vendors')
      } else {
        setVendors(vendorsData || [])
      }

    } catch (error) {
      console.error('Error in fetchInventoryData:', error)
      showError('Failed to load inventory data')
    } finally {
      setLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    if (operationsUser) {
      fetchInventoryData()
    }
  }, [operationsUser])

  // Filter data based on search term
  const filteredIngredients = ingredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ingredient.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle ingredient updates
  const handleUpdateStock = async (ingredientId: string, newStock: number) => {
    try {
      const { error } = await supabase
        .from('ingredients')
        .update({ 
          current_stock: newStock,
          last_updated: new Date().toISOString()
        })
        .eq('id', ingredientId)

      if (error) {
        console.error('Error updating stock:', error)
        showError('Failed to update stock')
        return
      }

      showSuccess('Stock updated successfully')
      await fetchInventoryData() // Refresh data

    } catch (error) {
      console.error('Error in handleUpdateStock:', error)
      showError('Failed to update stock')
    }
  }

  // Handle vendor status toggle
  const handleToggleVendorStatus = async (vendorId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .update({ is_active: isActive })
        .eq('id', vendorId)

      if (error) {
        console.error('Error updating vendor status:', error)
        showError('Failed to update vendor status')
        return
      }

      showSuccess(`Vendor ${isActive ? 'activated' : 'deactivated'} successfully`)
      await fetchInventoryData() // Refresh data

    } catch (error) {
      console.error('Error in handleToggleVendorStatus:', error)
      showError('Failed to update vendor status')
    }
  }

  // Handle delete operations
  const handleDeleteIngredient = async (ingredientId: string) => {
    if (!confirm('Are you sure you want to delete this ingredient? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('ingredients')
        .delete()
        .eq('id', ingredientId)

      if (error) {
        console.error('Error deleting ingredient:', error)
        showError('Failed to delete ingredient')
        return
      }

      showSuccess('Ingredient deleted successfully')
      await fetchInventoryData() // Refresh data

    } catch (error) {
      console.error('Error in handleDeleteIngredient:', error)
      showError('Failed to delete ingredient')
    }
  }

  const handleDeleteVendor = async (vendorId: string) => {
    if (!confirm('Are you sure you want to delete this vendor? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', vendorId)

      if (error) {
        console.error('Error deleting vendor:', error)
        showError('Failed to delete vendor')
        return
      }

      showSuccess('Vendor deleted successfully')
      await fetchInventoryData() // Refresh data

    } catch (error) {
      console.error('Error in handleDeleteVendor:', error)
      showError('Failed to delete vendor')
    }
  }

  // Placeholder functions for edit operations
  const handleEditIngredient = (ingredient: Ingredient) => {
    showInfo('Edit ingredient functionality to be implemented')
  }

  const handleEditVendor = (vendor: Vendor) => {
    showInfo('Edit vendor functionality to be implemented')
  }

  const handleAddIngredient = () => {
    showInfo('Add ingredient functionality to be implemented')
  }

  const handleAddVendor = () => {
    showInfo('Add vendor functionality to be implemented')
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <InventoryHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddIngredient={handleAddIngredient}
        onAddVendor={handleAddVendor}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'ingredients' ? (
          /* Ingredients Tab */
          <div>
            {filteredIngredients.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No ingredients found</h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first ingredient'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredIngredients.map((ingredient) => (
                  <IngredientCard
                    key={ingredient.id}
                    ingredient={ingredient}
                    onEdit={handleEditIngredient}
                    onDelete={handleDeleteIngredient}
                    onUpdateStock={handleUpdateStock}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Vendors Tab */
          <div>
            {filteredVendors.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first vendor'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredVendors.map((vendor) => (
                  <VendorCard
                    key={vendor.id}
                    vendor={vendor}
                    onEdit={handleEditVendor}
                    onDelete={handleDeleteVendor}
                    onToggleStatus={handleToggleVendorStatus}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
