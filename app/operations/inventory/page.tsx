'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/Toast/ToastProvider'
import { supabase } from '@/lib/supabase/client'
import { getOperationsUserClient } from '@/lib/middleware/operations-client'
import Link from 'next/link'
import { 
  Package as InventoryIcon,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  ArrowLeft,
  Edit,
  Trash2,
  X
} from 'lucide-react'

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

interface Ingredient {
  id: string
  name: string
  current_stock: number
  unit: string
  reorder_level: number
  unit_cost: number
  supplier: string | null  // This is now a UUID reference to vendors table, not a name
  last_updated: string
}

interface IngredientUpdate {
  id: string
  ingredient_id: string
  previous_stock: number
  new_stock: number
  stock_change_amount: number
  previous_cost: number
  new_cost: number
  cost_change_amount: number
  cost_change_percent: number
  previous_supplier: string | null
  new_supplier: string | null
  update_type: 'purchase' | 'usage' | 'adjustment' | 'waste'
  notes: string | null
  created_at: string
}

export default function InventoryManagement() {
  const { user } = useAuth()
  const { showSuccess, showError, showWarning, showInfo } = useToast()
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'critical'>('all')
  const [operationsUser, setOperationsUser] = useState<any>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showUpdateStockModal, setShowUpdateStockModal] = useState(false)
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null)
  const [showPOModal, setShowPOModal] = useState(false)
  const [poFormData, setPoFormData] = useState({
    ingredient_id: '',
    quantity: '',
    supplier_id: '',
    unit_cost: ''
  })
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    current_stock: '',
    unit: '',
    reorder_level: '',
    unit_cost: '',
    supplier: ''
  })
  const [updateStockData, setUpdateStockData] = useState({
    stock_to_add: '',
    new_unit_cost: '',
    new_supplier: '',
    update_type: 'purchase' as 'purchase' | 'usage' | 'adjustment' | 'waste',
    notes: ''
  })

  useEffect(() => {
    checkOperationsAccess()
    fetchInventory()
    fetchVendors()
  }, [])

  const checkOperationsAccess = async () => {
    const opsUser = await getOperationsUserClient()
    if (!opsUser) {
      window.location.href = '/'
      return
    }
    setOperationsUser(opsUser)
  }

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('id, name')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setVendors((data || []) as Vendor[])
    } catch (error) {
      console.error('Error fetching vendors:', error)
    }
  }

  const handleAddIngredient = async () => {
    try {
      // Check for duplicates
      const isDuplicate = await checkDuplicateIngredient(formData.name)
      if (isDuplicate) {
        return
      }

      const { data: newIngredient, error } = await supabase
        .from('ingredients')
        .insert({
          name: formData.name.trim(),
          current_stock: parseFloat(formData.current_stock) || 0,
          unit: formData.unit.trim(),
          reorder_level: parseFloat(formData.reorder_level) || 0,
          unit_cost: parseFloat(formData.unit_cost) || 0,
          supplier: formData.supplier || null
        })
        .select()
        .single()

      if (error) throw error
      
      // Record initial update for tracking
      if (newIngredient) {
        await recordIngredientUpdate(newIngredient.id, {
          previous_stock: 0,
          new_stock: newIngredient.current_stock,
          previous_cost: 0,
          new_cost: newIngredient.unit_cost,
          previous_supplier: null,
          new_supplier: newIngredient.supplier,
          update_type: 'purchase',
          notes: 'Initial ingredient creation'
        })
      }
      
      setShowAddModal(false)
      resetForm()
      await fetchInventory()
    } catch (error) {
      console.error('Error adding ingredient:', error)
      showError(error instanceof Error ? error : new Error('Failed to add ingredient'))
    }
  }

  const handleEditIngredient = async () => {
    if (!selectedIngredient) return

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        showWarning('Ingredient name is required', 'Validation Error')
        return
      }

      const { error } = await supabase
        .from('ingredients')
        .update({
          name: formData.name.trim(),
          current_stock: parseFloat(formData.current_stock) || 0,
          unit: formData.unit.trim(),
          reorder_level: parseFloat(formData.reorder_level) || 0,
          unit_cost: parseFloat(formData.unit_cost) || 0,
          supplier: formData.supplier || null
        })
        .eq('id', selectedIngredient.id)

      if (error) throw error
      
      setShowEditModal(false)
      resetForm()
      setSelectedIngredient(null)
      await fetchInventory()
    } catch (error) {
      console.error('Error updating ingredient:', error)
      showError(error instanceof Error ? error : new Error('Failed to update ingredient'))
    }
  }

  const handleDeleteIngredient = async () => {
    if (!selectedIngredient) return

    try {
      const { error } = await supabase
        .from('ingredients')
        .delete()
        .eq('id', selectedIngredient.id)

      if (error) throw error
      
      setShowDeleteModal(false)
      setSelectedIngredient(null)
      await fetchInventory()
    } catch (error) {
      console.error('Error deleting ingredient:', error)
      showError(error instanceof Error ? error : new Error('Failed to delete ingredient'))
    }
  }

  const handleCreatePO = async () => {
    try {
      const quantity = parseFloat(poFormData.quantity)
      const unitCost = parseFloat(poFormData.unit_cost)
      
      if (!poFormData.ingredient_id || !poFormData.supplier_id || !quantity || !unitCost) {
        showWarning('Please fill in all required fields', 'Validation Error')
        return
      }

      const { data, error } = await supabase
        .rpc('generate_purchase_order_for_ingredient', {
          p_ingredient_id: poFormData.ingredient_id,
          p_required_quantity: quantity
        })

      if (error) throw error

      showSuccess('Purchase order created successfully!', 'PO Created')
      setShowPOModal(false)
      resetPOForm()
    } catch (error: any) {
      console.error('Error creating PO:', error)
      showError(error instanceof Error ? error : new Error('Failed to create purchase order'))
    }
  }

  const handleIngredientChange = (ingredientId: string) => {
    const ingredient = ingredients.find(i => i.id === ingredientId)
    if (ingredient) {
      setPoFormData(prev => ({
        ...prev,
        ingredient_id: ingredientId,
        supplier_id: ingredient.supplier || '',
        unit_cost: ingredient.unit_cost.toString()
      }))
    }
  }

  const resetPOForm = () => {
    setPoFormData({
      ingredient_id: '',
      quantity: '',
      supplier_id: '',
      unit_cost: ''
    })
  }

  const handleUpdateStock = async () => {
    if (!selectedIngredient) return

    console.log('handleUpdateStock called with:', {
      ingredient: selectedIngredient.name,
      stockToAdd: updateStockData.stock_to_add,
      newCost: updateStockData.new_unit_cost,
      newSupplier: updateStockData.new_supplier
    })

    try {
      const stockToAdd = parseFloat(updateStockData.stock_to_add) || 0
      const newStock = selectedIngredient.current_stock + stockToAdd
      const newUnitCost = parseFloat(updateStockData.new_unit_cost) || selectedIngredient.unit_cost
      
      // Handle supplier - ensure it's always a UUID or null
      let newSupplier = updateStockData.new_supplier || selectedIngredient.supplier
      
      // If newSupplier is empty, keep current
      if (!newSupplier) {
        newSupplier = selectedIngredient.supplier
      }
      
      // After migration, newSupplier should already be a UUID or null from the dropdown
      // No need for additional conversion logic
      
      // Current supplier is already a UUID or null after migration
      const currentSupplierId = selectedIngredient.supplier

      console.log('Calculated values:', { stockToAdd, newStock, newUnitCost, newSupplier, currentSupplierId })

      // Update ingredient
      const { error } = await supabase
        .from('ingredients')
        .update({
          current_stock: newStock,
          unit_cost: newUnitCost,
          supplier: newSupplier
        })
        .eq('id', selectedIngredient.id)

      if (error) throw error

      console.log('Ingredient updated successfully')

      // Record update (if tracking table exists)
      await recordIngredientUpdate(selectedIngredient.id, {
        previous_stock: selectedIngredient.current_stock,
        new_stock: newStock,
        previous_cost: selectedIngredient.unit_cost,
        new_cost: newUnitCost,
        previous_supplier: currentSupplierId,
        new_supplier: newSupplier,
        update_type: updateStockData.update_type,
        notes: updateStockData.notes
      })
      
      setShowUpdateStockModal(false)
      resetUpdateStockForm()
      setSelectedIngredient(null)
      await fetchInventory()
    } catch (error) {
      console.error('Error updating stock:', error)
      showError(error instanceof Error ? error : new Error('Failed to update stock'))
    }
  }

  const openUpdateStockModal = (ingredient: Ingredient) => {
    console.log('Opening Update Stock modal for:', ingredient.name)
    setSelectedIngredient(ingredient)
    
    // After migration, supplier is already a UUID or null
    setUpdateStockData({
      stock_to_add: '',
      new_unit_cost: ingredient.unit_cost.toString(),
      new_supplier: ingredient.supplier || '',
      update_type: 'purchase',
      notes: ''
    })
    setShowUpdateStockModal(true)
  }

  const openEditModal = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient)
    
    // After migration, supplier is already a UUID or null
    setFormData({
      name: ingredient.name,
      current_stock: ingredient.current_stock.toString(),
      unit: ingredient.unit,
      reorder_level: ingredient.reorder_level.toString(),
      unit_cost: ingredient.unit_cost.toString(),
      supplier: ingredient.supplier || ''
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient)
    setShowDeleteModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      current_stock: '',
      unit: '',
      reorder_level: '',
      unit_cost: '',
      supplier: ''
    })
    setDuplicateWarning(null)
  }

  const resetUpdateStockForm = () => {
    setUpdateStockData({
      stock_to_add: '',
      new_unit_cost: '',
      new_supplier: '',
      update_type: 'purchase',
      notes: ''
    })
  }

  const checkDuplicateIngredient = async (name: string) => {
    const normalizedName = name.trim().toLowerCase()
    const existing = ingredients.find(ingredient => 
      ingredient.name.toLowerCase() === normalizedName
    )
    
    if (existing) {
      setDuplicateWarning(`"${existing.name}" already exists. Use "Update Stock" instead.`)
      return true
    } else {
      setDuplicateWarning(null)
      return false
    }
  }

  const recordIngredientUpdate = async (ingredientId: string, updateData: any) => {
    try {
      const { error } = await supabase
        .from('ingredient_updates')
        .insert({
          ingredient_id: ingredientId,
          previous_stock: updateData.previous_stock,
          new_stock: updateData.new_stock,
          previous_cost: updateData.previous_cost,
          new_cost: updateData.new_cost,
          previous_supplier: updateData.previous_supplier,
          new_supplier: updateData.new_supplier,
          update_type: updateData.update_type,
          notes: updateData.notes || null
        })

      if (error) throw error
      console.log('Ingredient update tracked successfully')
    } catch (error) {
      console.error('Error recording ingredient update:', error)
    }
  }

  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .order('name')

      if (error) throw error
      setIngredients(data || [])
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStockStatus = (ingredient: Ingredient) => {
    const stockPercentage = (ingredient.current_stock / ingredient.reorder_level) * 100
    
    if (stockPercentage <= 25) return { status: 'critical', color: 'text-red-600 bg-red-50', icon: AlertTriangle }
    if (stockPercentage <= 50) return { status: 'low', color: 'text-orange-600 bg-orange-50', icon: TrendingDown }
    return { status: 'good', color: 'text-green-600 bg-green-50', icon: TrendingUp }
  }

  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
    const stockStatus = getStockStatus(ingredient)
    
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'low' && stockStatus.status === 'low') ||
      (filterStatus === 'critical' && stockStatus.status === 'critical')
    
    return matchesSearch && matchesFilter
  })

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num)
  }

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(num)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full animate-spin mb-4">
            <span className="text-2xl">🔄</span>
          </div>
          <p className="text-gray-600">Loading inventory...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/operations" className="text-gray-600 hover:text-gray-900 mr-4">
                <ArrowLeft className="w-5 h-5 inline mr-2" />
                Back to Dashboard
              </Link>
              <span className="text-2xl mr-3">📦</span>
              <h1 className="text-xl font-bold text-gray-900">Inventory Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowPOModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create PO
              </button>
              <div className="text-sm text-gray-600">
                {ingredients.length} ingredients
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">In Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {ingredients.filter(i => getStockStatus(i).status === 'good').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {ingredients.filter(i => getStockStatus(i).status === 'low').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Critical Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {ingredients.filter(i => getStockStatus(i).status === 'critical').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    ingredients.reduce((sum, i) => sum + (i.current_stock * i.unit_cost), 0)
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <InventoryIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search ingredients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterStatus === 'all' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('low')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterStatus === 'low' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Low Stock
              </button>
              <button
                onClick={() => setFilterStatus('critical')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterStatus === 'critical' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Critical
              </button>
            </div>

            <button 
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Ingredient
            </button>
          </div>
        </div>

        {/* Ingredients Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ingredient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reorder Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIngredients.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      <InventoryIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p>No ingredients found</p>
                    </td>
                  </tr>
                ) : (
                  filteredIngredients.map((ingredient) => {
                    const stockStatus = getStockStatus(ingredient)
                    const StatusIcon = stockStatus.icon
                    const stockPercentage = (ingredient.current_stock / ingredient.reorder_level) * 100
                    
                    return (
                      <tr key={ingredient.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{ingredient.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatNumber(ingredient.current_stock)} {ingredient.unit}
                          </div>
                          <div className="text-sm text-gray-500">
                            {stockPercentage.toFixed(0)}% of reorder level
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatNumber(ingredient.reorder_level)} {ingredient.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {stockStatus.status.charAt(0).toUpperCase() + stockStatus.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(ingredient.unit_cost)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(ingredient.current_stock * ingredient.unit_cost)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(() => {
                            const supplier = ingredient.supplier;
                            if (!supplier) return '-';
                            
                            // After migration, supplier is always a UUID, so just find the vendor name
                            const vendor = vendors.find(v => v.id === supplier);
                            return vendor ? vendor.name : 'Unknown Vendor';
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                console.log('Update Stock button clicked for:', ingredient.name)
                                openUpdateStockModal(ingredient)
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Update Stock"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(ingredient)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Details"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(ingredient)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Ingredient"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alert Section */}
        {ingredients.some(i => getStockStatus(i).status === 'critical') && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Critical Stock Alert
                </h3>
                <p className="text-red-700">
                  {ingredients.filter(i => getStockStatus(i).status === 'critical').length} ingredients are at critical stock levels. 
                  Place orders with vendors immediately to avoid production delays.
                </p>
                <div className="mt-4">
                  <Link
                    href="/operations/vendors"
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Contact Vendors
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Ingredient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Add New Ingredient</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    resetForm()
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ingredient Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({...formData, name: e.target.value})
                      checkDuplicateIngredient(e.target.value)
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      duplicateWarning ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {duplicateWarning && (
                    <p className="mt-1 text-sm text-red-600">{duplicateWarning}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock *</label>
                  <input
                    type="number"
                    value={formData.current_stock}
                    onChange={(e) => setFormData({...formData, current_stock: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., kg, liters, pieces"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level *</label>
                  <input
                    type="number"
                    value={formData.reorder_level}
                    onChange={(e) => setFormData({...formData, reorder_level: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.unit_cost}
                    onChange={(e) => setFormData({...formData, unit_cost: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                  <select
                    value={formData.supplier}
                    onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a supplier</option>
                    {vendors.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  resetForm()
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddIngredient}
                disabled={!formData.name || !formData.current_stock || !formData.unit || !formData.reorder_level || !formData.unit_cost}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Ingredient
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Ingredient Modal */}
      {showEditModal && selectedIngredient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Edit Ingredient</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    resetForm()
                    setSelectedIngredient(null)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ingredient Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock *</label>
                  <input
                    type="number"
                    value={formData.current_stock}
                    onChange={(e) => setFormData({...formData, current_stock: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., kg, liters, pieces"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level *</label>
                  <input
                    type="number"
                    value={formData.reorder_level}
                    onChange={(e) => setFormData({...formData, reorder_level: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.unit_cost}
                    onChange={(e) => setFormData({...formData, unit_cost: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                  <select
                    value={formData.supplier}
                    onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a supplier</option>
                    {vendors.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  resetForm()
                  setSelectedIngredient(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditIngredient}
                disabled={!formData.name || !formData.current_stock || !formData.unit || !formData.reorder_level || !formData.unit_cost}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Ingredient
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Ingredient Modal */}
      {showDeleteModal && selectedIngredient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Delete Ingredient</h2>
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setSelectedIngredient(null)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Delete {selectedIngredient.name}?
                </h3>
                <p className="text-gray-600 mb-4">
                  This action cannot be undone. All ingredient data will be permanently deleted.
                </p>
              </div>
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedIngredient(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteIngredient}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete Ingredient
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Stock Modal */}
      {showUpdateStockModal && selectedIngredient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Update Stock - {selectedIngredient.name}</h2>
                <button
                  onClick={() => {
                    setShowUpdateStockModal(false)
                    resetUpdateStockForm()
                    setSelectedIngredient(null)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Current Values Display */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Current Values</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Stock:</span>
                    <p className="font-medium">{selectedIngredient.current_stock} {selectedIngredient.unit}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Unit Cost:</span>
                    <p className="font-medium">{formatCurrency(selectedIngredient.unit_cost)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Supplier:</span>
                    <p className="font-medium">
                      {(() => {
                        const supplier = selectedIngredient.supplier;
                        if (!supplier) return 'None';
                        
                        // After migration, supplier is always a UUID, so just find the vendor name
                        const vendor = vendors.find(v => v.id === supplier);
                        return vendor ? vendor.name : 'Unknown Vendor';
                      })()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Value:</span>
                    <p className="font-medium">{formatCurrency(selectedIngredient.current_stock * selectedIngredient.unit_cost)}</p>
                  </div>
                </div>
              </div>

              {/* Update Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock to Add/Subtract *</label>
                  <input
                    type="number"
                    value={updateStockData.stock_to_add}
                    onChange={(e) => setUpdateStockData({...updateStockData, stock_to_add: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Use negative numbers to subtract"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Enter positive to add, negative to subtract</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Unit Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    value={updateStockData.new_unit_cost}
                    onChange={(e) => setUpdateStockData({...updateStockData, new_unit_cost: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Leave empty to keep current"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Update Type *</label>
                  <select
                    value={updateStockData.update_type}
                    onChange={(e) => setUpdateStockData({...updateStockData, update_type: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="purchase">Purchase</option>
                    <option value="usage">Usage</option>
                    <option value="adjustment">Manual Adjustment</option>
                    <option value="waste">Waste/Loss</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Supplier</label>
                  <select
                    value={updateStockData.new_supplier}
                    onChange={(e) => setUpdateStockData({...updateStockData, new_supplier: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Keep current supplier</option>
                    {vendors.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={updateStockData.notes}
                    onChange={(e) => setUpdateStockData({...updateStockData, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    placeholder="Optional notes about this update"
                  />
                </div>
              </div>

              {/* Preview of Changes */}
              {updateStockData.stock_to_add && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">Preview of Changes</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">New Stock:</span>
                      <p className="font-medium text-blue-900">
                        {selectedIngredient.current_stock + (parseFloat(updateStockData.stock_to_add) || 0)} {selectedIngredient.unit}
                      </p>
                    </div>
                    <div>
                      <span className="text-blue-700">New Cost:</span>
                      <p className="font-medium text-blue-900">
                        {formatCurrency(parseFloat(updateStockData.new_unit_cost) || selectedIngredient.unit_cost)}
                      </p>
                    </div>
                    <div>
                      <span className="text-blue-700">New Value:</span>
                      <p className="font-medium text-blue-900">
                        {formatCurrency(
                          (selectedIngredient.current_stock + (parseFloat(updateStockData.stock_to_add) || 0)) * 
                          (parseFloat(updateStockData.new_unit_cost) || selectedIngredient.unit_cost)
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-blue-700">Value Change:</span>
                      <p className="font-medium text-blue-900">
                        {formatCurrency(
                          ((selectedIngredient.current_stock + (parseFloat(updateStockData.stock_to_add) || 0)) * 
                          (parseFloat(updateStockData.new_unit_cost) || selectedIngredient.unit_cost)) -
                          (selectedIngredient.current_stock * selectedIngredient.unit_cost)
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowUpdateStockModal(false)
                  resetUpdateStockForm()
                  setSelectedIngredient(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStock}
                disabled={!updateStockData.stock_to_add}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Stock
              </button>
            </div>
          </div>
        </div>
      )}
      

      {/* PO Creation Modal */}
      {showPOModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Create Purchase Order</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="ingredient" className="block text-sm font-medium text-gray-700 mb-1">
                  Ingredient *
                </label>
                <select
                  id="ingredient"
                  value={poFormData.ingredient_id}
                  onChange={(e) => handleIngredientChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select ingredient</option>
                  {ingredients.map((ingredient) => (
                    <option key={ingredient.id} value={ingredient.id}>
                      {ingredient.name} (Current: {ingredient.current_stock} {ingredient.unit})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <input
                  id="quantity"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={poFormData.quantity}
                  onChange={(e) => setPoFormData({...poFormData, quantity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter quantity"
                />
              </div>
              
              <div>
                <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier *
                </label>
                <select
                  id="supplier"
                  value={poFormData.supplier_id}
                  onChange={(e) => setPoFormData({...poFormData, supplier_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select supplier</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="unit_cost" className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Cost (₹) *
                </label>
                <input
                  id="unit_cost"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={poFormData.unit_cost}
                  onChange={(e) => setPoFormData({...poFormData, unit_cost: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter unit cost"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowPOModal(false)
                  resetPOForm()
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePO}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Create PO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
