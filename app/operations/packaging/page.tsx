'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Package, AlertTriangle, TrendingDown, Plus, Edit2, Trash2 } from 'lucide-react'

interface PackagingMaterial {
  id: string
  name: string
  type: 'packaging' | 'label'
  unit: string
  current_stock: number
  reorder_level: number
  unit_cost: number
  description?: string
  stock_status: 'critical' | 'low' | 'sufficient'
  supplier_name?: string
  supplier_phone?: string
  updated_at: string
}

interface PackagingAlert {
  material_id: string
  material_name: string
  material_type: string
  current_stock: number
  reorder_level: number
  shortage: number
  supplier_name?: string
  supplier_phone?: string
  alert_level: 'critical' | 'warning' | 'info'
}

export default function PackagingInventory() {
  const [materials, setMaterials] = useState<PackagingMaterial[]>([])
  const [alerts, setAlerts] = useState<PackagingAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<PackagingMaterial | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'packaging' as 'packaging' | 'label',
    unit: 'pieces',
    current_stock: '',
    reorder_level: '',
    unit_cost: '',
    description: ''
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num)
  }

  const getStockStatus = (material: PackagingMaterial) => {
    switch (material.stock_status) {
      case 'critical':
        return { status: 'critical', color: 'text-red-600 bg-red-50', icon: AlertTriangle }
      case 'low':
        return { status: 'low', color: 'text-orange-600 bg-orange-50', icon: TrendingDown }
      default:
        return { status: 'sufficient', color: 'text-green-600 bg-green-50', icon: Package }
    }
  }

  const fetchPackagingMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('packaging_inventory_status')
        .select('*')
        .order('type, name')

      if (error) throw error
      setMaterials(data || [])
    } catch (error) {
      console.error('Error fetching packaging materials:', error)
    }
  }

  const fetchPackagingAlerts = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_packaging_alerts')

      if (error) throw error
      setAlerts(data || [])
    } catch (error) {
      console.error('Error fetching packaging alerts:', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchPackagingMaterials(),
        fetchPackagingAlerts()
      ])
      setLoading(false)
    }

    loadData()
  }, [])

  const handleAddMaterial = async () => {
    try {
      const { error } = await supabase
        .from('packaging_materials')
        .insert({
          name: formData.name.trim(),
          type: formData.type,
          unit: formData.unit.trim(),
          current_stock: parseFloat(formData.current_stock) || 0,
          reorder_level: parseFloat(formData.reorder_level) || 0,
          unit_cost: parseFloat(formData.unit_cost) || 0,
          description: formData.description.trim()
        })

      if (error) throw error

      await fetchPackagingMaterials()
      await fetchPackagingAlerts()
      setShowAddModal(false)
      resetForm()
    } catch (error) {
      console.error('Error adding packaging material:', error)
    }
  }

  const handleEditMaterial = async () => {
    if (!editingMaterial) return

    try {
      const { error } = await supabase
        .from('packaging_materials')
        .update({
          name: formData.name.trim(),
          type: formData.type,
          unit: formData.unit.trim(),
          current_stock: parseFloat(formData.current_stock) || 0,
          reorder_level: parseFloat(formData.reorder_level) || 0,
          unit_cost: parseFloat(formData.unit_cost) || 0,
          description: formData.description.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', editingMaterial.id)

      if (error) throw error

      await fetchPackagingMaterials()
      await fetchPackagingAlerts()
      setEditingMaterial(null)
      resetForm()
    } catch (error) {
      console.error('Error updating packaging material:', error)
    }
  }

  const handleDeleteMaterial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this packaging material?')) return

    try {
      const { error } = await supabase
        .from('packaging_materials')
        .delete()
        .eq('id', id)

      if (error) throw error

      await fetchPackagingMaterials()
      await fetchPackagingAlerts()
    } catch (error) {
      console.error('Error deleting packaging material:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'packaging',
      unit: 'pieces',
      current_stock: '',
      reorder_level: '',
      unit_cost: '',
      description: ''
    })
  }

  const startEdit = (material: PackagingMaterial) => {
    setEditingMaterial(material)
    setFormData({
      name: material.name,
      type: material.type,
      unit: material.unit,
      current_stock: material.current_stock.toString(),
      reorder_level: material.reorder_level.toString(),
      unit_cost: material.unit_cost.toString(),
      description: material.description || ''
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading packaging inventory...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Packaging & Labels Inventory</h1>
          <p className="text-gray-600 mt-2">Manage packaging materials and product labels</p>
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-900 mb-4">
              <AlertTriangle className="inline w-5 h-5 mr-2" />
              Stock Alerts ({alerts.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alerts.map((alert) => (
                <div key={alert.material_id} className={`p-4 rounded-lg border ${
                  alert.alert_level === 'critical' ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{alert.material_name}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      alert.alert_level === 'critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {alert.alert_level}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Current: {formatNumber(alert.current_stock)} {alert.material_type === 'packaging' ? 'pcs' : 'labels'}</p>
                    <p>Reorder at: {formatNumber(alert.reorder_level)}</p>
                    {alert.shortage > 0 && (
                      <p className="font-medium text-red-600">Shortage: {formatNumber(alert.shortage)}</p>
                    )}
                    {alert.supplier_name && (
                      <p className="text-xs text-gray-500">Supplier: {alert.supplier_name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Materials</p>
                <p className="text-2xl font-bold text-gray-900">{materials.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Critical Stock</p>
                <p className="text-2xl font-bold text-red-600">
                  {materials.filter(m => m.stock_status === 'critical').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-orange-600">
                  {materials.filter(m => m.stock_status === 'low').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <Package className="h-4 w-4 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    materials.reduce((sum, m) => sum + (m.current_stock * m.unit_cost), 0)
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Inventory Items</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Material
          </button>
        </div>

        {/* Materials Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reorder Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {materials.map((material) => {
                  const stockStatus = getStockStatus(material)
                  const StatusIcon = stockStatus.icon
                  
                  return (
                    <tr key={material.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{material.name}</div>
                          {material.description && (
                            <div className="text-sm text-gray-500">{material.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          material.type === 'packaging' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {material.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatNumber(material.current_stock)} {material.unit}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(material.reorder_level)} {material.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(material.unit_cost)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(material.current_stock * material.unit_cost)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {stockStatus.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEdit(material)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMaterial(material.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {(showAddModal || editingMaterial) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingMaterial ? 'Edit Material' : 'Add New Material'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as 'packaging' | 'label'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="packaging">Packaging</option>
                    <option value="label">Label</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="pieces, rolls, boxes, etc."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level *</label>
                    <input
                      type="number"
                      value={formData.reorder_level}
                      onChange={(e) => setFormData({...formData, reorder_level: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Optional description..."
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingMaterial(null)
                    resetForm()
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingMaterial ? handleEditMaterial : handleAddMaterial}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingMaterial ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
