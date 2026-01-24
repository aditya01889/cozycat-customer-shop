'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/Toast/ToastProvider'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import { 
  Package, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react'

interface ProductionBatch {
  id: string
  batch_number: string
  quantity_produced: number
  status: string
  created_at: string
  updated_at: string
  order_id?: string
  order_number?: string
  order_status?: string
  order_total?: number
  item_count?: number
  total_planned_quantity?: number
  total_produced_quantity?: number
  completion_percentage?: number
  start_time?: string
  end_time?: string
  priority?: number
  notes?: string
}

export default function ManageBatches() {
  const { user } = useAuth()
  const { showSuccess, showError, showWarning, showInfo } = useToast()
  const [batches, setBatches] = useState<ProductionBatch[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState<ProductionBatch | null>(null)
  const [editStatus, setEditStatus] = useState('')

  useEffect(() => {
    fetchBatches()
  }, [])

  const fetchBatches = async () => {
    try {
      const { data, error } = await supabase
        .from('batch_details_view')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setBatches(data || [])
    } catch (error) {
      console.error('Error fetching batches:', error)
      // Fallback to basic query if view doesn't exist yet
      try {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('production_batches')
          .select('*')
          .order('created_at', { ascending: false })

        if (fallbackError) throw fallbackError
        setBatches(fallbackData || [])
      } catch (fallbackError) {
        console.error('Error with fallback query:', fallbackError)
      }
    } finally {
      setLoading(false)
    }
  }

  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.batch_number.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || batch.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'on_hold':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planned':
        return <Clock className="w-4 h-4" />
      case 'in_progress':
        return <AlertCircle className="w-4 h-4" />
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelled':
        return <AlertCircle className="w-4 h-4" />
      case 'on_hold':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  const handleViewBatch = (batch: ProductionBatch) => {
    setSelectedBatch(batch)
    setShowViewModal(true)
  }

  const handleEditBatch = (batch: ProductionBatch) => {
    setSelectedBatch(batch)
    setEditStatus(batch.status)
    setShowEditModal(true)
  }

  const handleDeleteBatch = (batch: ProductionBatch) => {
    setSelectedBatch(batch)
    setShowDeleteModal(true)
  }

  const handleEditSubmit = async () => {
    if (!selectedBatch || !editStatus) return
    
    // Validate batch ID
    if (!selectedBatch.id || selectedBatch.id === 'undefined') {
      showError(new Error('Invalid batch selected'))
      return
    }
    
    const validStatuses = ['planned', 'in_progress', 'completed', 'cancelled', 'on_hold']
    if (!validStatuses.includes(editStatus)) {
      showWarning('Please select a valid status', 'Invalid Status')
      return
    }
    
    await updateBatchStatus(selectedBatch.id, editStatus)
    setShowEditModal(false)
    setSelectedBatch(null)
    setEditStatus('')
  }

  const handleDeleteConfirm = async () => {
    if (!selectedBatch) return
    
    // Validate batch ID
    if (!selectedBatch.id || selectedBatch.id === 'undefined') {
      showError(new Error('Invalid batch selected'))
      return
    }
    
    await deleteBatch(selectedBatch.id)
    setShowDeleteModal(false)
    setSelectedBatch(null)
  }

  const updateBatchStatus = async (batchId: string, newStatus: string) => {
    try {
      // Validate inputs
      if (!batchId || batchId === 'undefined') {
        throw new Error('Invalid batch ID')
      }
      
      if (!newStatus) {
        throw new Error('Status is required')
      }

      // Use basic update since RPC function doesn't exist yet
      const { error } = await supabase
        .from('production_batches')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', batchId)

      if (error) throw error
      
      // Refresh the batches list
      fetchBatches()
      showSuccess(`Batch status updated to ${newStatus}`, 'Status Updated')
    } catch (error) {
      console.error('Error updating batch status:', error)
      showError(error instanceof Error ? error : new Error('Failed to update batch status'))
    }
  }

  const deleteBatch = async (batchId: string) => {
    try {
      // Validate inputs
      if (!batchId || batchId === 'undefined') {
        throw new Error('Invalid batch ID')
      }

      const { error } = await supabase
        .from('production_batches')
        .delete()
        .eq('id', batchId)

      if (error) throw error
      
      // Refresh the batches list
      fetchBatches()
      showSuccess('Batch deleted successfully', 'Batch Deleted')
    } catch (error) {
      console.error('Error deleting batch:', error)
      showError(error instanceof Error ? error : new Error('Failed to delete batch'))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/operations" className="text-indigo-600 hover:text-indigo-800 mr-4">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Manage Production Batches</h1>
            </div>
            <Link
              href="/operations/batches/create"
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Batch
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search batch numbers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option key="all" value="all">All Status</option>
                <option key="planned" value="planned">Planned</option>
                <option key="in_progress" value="in_progress">In Progress</option>
                <option key="completed" value="completed">Completed</option>
                <option key="cancelled" value="cancelled">Cancelled</option>
                <option key="on_hold" value="on_hold">On Hold</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Batches List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredBatches.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No production batches found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Get started by creating your first production batch'}
              </p>
              <Link
                href="/operations/batches/create"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Batch
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batch Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completion
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBatches.map((batch, index) => (
                    <tr key={batch.id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Package className="w-5 h-5 text-indigo-600 mr-2" />
                          <span className="font-medium text-gray-900">{batch.batch_number}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(batch.status || 'unknown')}`}>
                          {getStatusIcon(batch.status || 'unknown')}
                          <span className="ml-1">{(batch.status || 'unknown').replace('_', ' ').toUpperCase()}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{batch.order_number || 'N/A'}</div>
                          <div className="text-gray-500">₹{batch.order_total || '0'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        <div className="text-sm">
                          <div className="font-medium">{batch.item_count || 0} items</div>
                          <div className="text-gray-500">{batch.total_planned_quantity || 0} units</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {batch.completion_percentage || 0}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-indigo-600 h-2 rounded-full" 
                                style={{ width: `${batch.completion_percentage || 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(batch.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewBatch(batch)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="View Batch Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditBatch(batch)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Edit Batch"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteBatch(batch)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Batch"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* View Batch Modal */}
      {showViewModal && selectedBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Batch Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Batch Number</label>
                  <p className="mt-1 text-sm text-gray-900 font-medium">{selectedBatch.batch_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusColor(selectedBatch.status)}`}>
                    {getStatusIcon(selectedBatch.status)}
                    <span className="ml-1">{(selectedBatch.status || 'unknown').replace('_', ' ').toUpperCase()}</span>
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedBatch.priority || 1}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity Produced</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedBatch.quantity_produced}</p>
                </div>
              </div>

              {/* Order Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Order Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Order Number</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedBatch.order_number || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Order Status</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedBatch.order_status || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Order Total</label>
                    <p className="mt-1 text-sm text-gray-900">₹{selectedBatch.order_total || '0'}</p>
                  </div>
                </div>
              </div>

              {/* Production Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Production Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Items in Batch</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedBatch.item_count || 0} items</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Planned Quantity</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedBatch.total_planned_quantity || 0} units</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Completion</label>
                    <div className="mt-1">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full" 
                            style={{ width: `${selectedBatch.completion_percentage || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{selectedBatch.completion_percentage || 0}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Timeline</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created</label>
                    <p className="mt-1 text-sm text-gray-900">{new Date(selectedBatch.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Started</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedBatch.start_time ? new Date(selectedBatch.start_time).toLocaleString() : 'Not started'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ended</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedBatch.end_time ? new Date(selectedBatch.end_time).toLocaleString() : 'Not completed'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <p className="mt-1 text-sm text-gray-900">{selectedBatch.notes || 'No notes'}</p>
              </div>
            </div>

            <div className="flex justify-end p-6 border-t">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Batch Modal */}
      {showEditModal && selectedBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Edit Batch Status</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Batch Number</label>
                <p className="text-sm text-gray-900 font-medium">{selectedBatch.batch_number}</p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedBatch.status)}`}>
                  {getStatusIcon(selectedBatch.status)}
                  <span className="ml-1">{(selectedBatch.status || 'unknown').replace('_', ' ').toUpperCase()}</span>
                </span>
              </div>
              
              <div className="mb-6">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <select
                  id="status"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option key="placeholder" value="">Select a status</option>
                  <option key="planned" value="planned">Planned</option>
                  <option key="in_progress" value="in_progress">In Progress</option>
                  <option key="completed" value="completed">Completed</option>
                  <option key="cancelled" value="cancelled">Cancelled</option>
                  <option key="on_hold" value="on_hold">On Hold</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={!editStatus}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-3">
                  <h2 className="text-lg font-medium text-gray-900">Delete Batch</h2>
                  <p className="text-sm text-gray-500">This action cannot be undone.</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-700">
                  Are you sure you want to delete batch <span className="font-medium">{selectedBatch.batch_number}</span>?
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Batch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
