'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Plus, X, Edit2, Trash2, MapPin, Phone, Mail } from 'lucide-react'

// Dynamically import heavy components
const AddressForm = dynamic(() => import('./AddressForm'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
})

const AddressCard = dynamic(() => import('./AddressCard'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
})

const MapComponent = dynamic(() => import('./MapComponent'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>
})

interface Address {
  id: string
  type: 'shipping' | 'billing'
  name: string
  phone: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
}

interface AddressManagerOptimizedProps {
  userId: string
  onAddressSelect?: (address: Address) => void
  selectedAddressId?: string
  allowEdit?: boolean
  allowDelete?: boolean
  showMap?: boolean
}

export default function AddressManagerOptimized({
  userId,
  onAddressSelect,
  selectedAddressId,
  allowEdit = true,
  allowDelete = true,
  showMap = false
}: AddressManagerOptimizedProps) {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'shipping' | 'billing'>('shipping')

  // Load addresses
  useEffect(() => {
    loadAddresses()
  }, [userId])

  const loadAddresses = async () => {
    try {
      setLoading(true)
      // API call to load addresses
      const response = await fetch(`/api/user/addresses`)
      const data = await response.json()
      setAddresses(data.addresses || [])
    } catch (error) {
      console.error('Failed to load addresses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAddress = async (addressData: Partial<Address>) => {
    try {
      const response = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...addressData, user_id: userId })
      })
      
      if (response.ok) {
        await loadAddresses()
        setShowAddForm(false)
        return { success: true }
      }
      return { success: false, error: 'Failed to add address' }
    } catch (error) {
      console.error('Failed to add address:', error)
      return { success: false, error: 'Failed to add address' }
    }
  }

  const handleUpdateAddress = async (id: string, addressData: Partial<Address>) => {
    try {
      const response = await fetch(`/api/user/addresses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressData)
      })
      
      if (response.ok) {
        await loadAddresses()
        setEditingAddress(null)
        return { success: true }
      }
      return { success: false, error: 'Failed to update address' }
    } catch (error) {
      console.error('Failed to update address:', error)
      return { success: false, error: 'Failed to update address' }
    }
  }

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return
    }

    try {
      const response = await fetch(`/api/user/addresses/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await loadAddresses()
        return { success: true }
      }
      return { success: false, error: 'Failed to delete address' }
    } catch (error) {
      console.error('Failed to delete address:', error)
      return { success: false, error: 'Failed to delete address' }
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      const response = await fetch(`/api/user/addresses/${id}/default`, {
        method: 'PATCH'
      })
      
      if (response.ok) {
        await loadAddresses()
        return { success: true }
      }
      return { success: false, error: 'Failed to set default address' }
    } catch (error) {
      console.error('Failed to set default address:', error)
      return { success: false, error: 'Failed to set default address' }
    }
  }

  const filteredAddresses = addresses.filter(addr => addr.type === activeTab)

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-gray-200 h-8 rounded-lg"></div>
        <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
        <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Addresses</h2>
          <p className="text-gray-600">
            Add and manage your shipping and billing addresses
          </p>
        </div>
        
        {allowEdit && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            <span>Add Address</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('shipping')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'shipping'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Shipping Addresses
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'billing'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Billing Addresses
          </button>
        </nav>
      </div>

      {/* Add Address Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Add New Address</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <AddressForm
            onSubmit={handleAddAddress}
            onCancel={() => setShowAddForm(false)}
            type={activeTab}
          />
        </div>
      )}

      {/* Edit Address Form */}
      {editingAddress && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Edit Address</h3>
            <button
              onClick={() => setEditingAddress(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <AddressForm
            onSubmit={(data) => handleUpdateAddress(editingAddress.id, data)}
            onCancel={() => setEditingAddress(null)}
            initialData={editingAddress}
            type={activeTab}
          />
        </div>
      )}

      {/* Addresses List */}
      <div className="space-y-4">
        {filteredAddresses.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab} addresses
            </h3>
            <p className="text-gray-500">
              Add your first {activeTab} address to get started
            </p>
          </div>
        ) : (
          filteredAddresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={allowEdit ? () => setEditingAddress(address) : undefined}
              onDelete={allowDelete ? () => handleDeleteAddress(address.id) : undefined}
              onSetDefault={() => handleSetDefault(address.id)}
              onSelect={onAddressSelect}
              isSelected={selectedAddressId === address.id}
              showMap={showMap}
            />
          ))
        )}
      </div>

      {/* Map View */}
      {showMap && filteredAddresses.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Locations</h3>
          <MapComponent
            addresses={filteredAddresses}
            onAddressSelect={onAddressSelect}
          />
        </div>
      )}
    </div>
  )
}
