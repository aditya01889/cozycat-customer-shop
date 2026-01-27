'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/Toast/ToastProvider'
import { supabase } from '@/lib/supabase/client'
import { getOperationsUserClient } from '@/lib/middleware/operations-client'
import dynamic from 'next/dynamic'
import { Search, Filter, Plus, Package as InventoryIcon, Link } from 'lucide-react'
import OperationsPageHeader from '@/components/operations/OperationsPageHeader'

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

const IngredientForm = dynamic(() => import('@/components/operations/IngredientForm'), {
  loading: () => (
    <div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>
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
}

export default function InventoryOptimized() {
  const { user } = useAuth()
  const { showSuccess, showError, showWarning, showInfo } = useToast()
  
  // State management
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [operationsUser, setOperationsUser] = useState<any>(null)
  const [showIngredientForm, setShowIngredientForm] = useState(false)
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null)

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

  // Handle ingredient updates
  const handleUpdateStock = async (ingredientId: string, newStock: number) => {
    try {
      const { error } = await supabase
        .from('ingredients')
        .update({ 
          current_stock: newStock
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

  // Handle add/edit operations
  const handleAddIngredient = () => {
    setEditingIngredient(null)
    setShowIngredientForm(true)
  }

  const handleEditIngredient = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient)
    setShowIngredientForm(true)
  }

  const handleIngredientSaved = () => {
    fetchInventoryData()
    setShowIngredientForm(false)
    setEditingIngredient(null)
    showSuccess('Ingredient saved successfully')
  }

  const handleCancelIngredientForm = () => {
    setShowIngredientForm(false)
    setEditingIngredient(null)
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
      <OperationsPageHeader
        title="Inventory Management"
        description="Manage ingredients and packaging materials"
        icon={<InventoryIcon className="h-8 w-8 text-blue-600" />}
        actions={
          <div className="flex items-center space-x-3">
            <button
              onClick={handleAddIngredient}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span>Add Ingredient</span>
            </button>
          </div>
        }
      >
        {/* Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 space-y-4 sm:space-y-0 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {ingredients.length} ingredients
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-64"
            />
          </div>
        </div>
      </OperationsPageHeader>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredIngredients.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No ingredients found
            </h3>
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

      {/* Modal Forms */}
      {showIngredientForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <IngredientForm
            ingredient={editingIngredient}
            onSave={handleIngredientSaved}
            onCancel={handleCancelIngredientForm}
          />
        </div>
      )}
    </div>
  )
}
