'use client'

import { useState, useEffect } from 'react'
import { MapPin, Navigation, Plus, Trash2, Edit2, Home, Check, X } from 'lucide-react'

interface Address {
  id: string
  address_line1: string
  address_line2: string
  landmark: string
  city: string
  state: string
  pincode: string
  latitude: number | null
  longitude: number | null
  is_default: boolean
  delivery_notes: string
}

interface SimpleAddressManagerProps {
  addresses: Address[]
  onAddAddress: (address: Omit<Address, 'id'>) => Promise<void>
  onUpdateAddress: (id: string, address: Partial<Address>) => Promise<void>
  onDeleteAddress: (id: string) => Promise<void>
  onSetDefault: (id: string) => Promise<void>
}

export default function SimpleAddressManager({ 
  addresses, 
  onAddAddress, 
  onUpdateAddress, 
  onDeleteAddress, 
  onSetDefault 
}: SimpleAddressManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    address_line1: '',
    address_line2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    delivery_notes: '',
    latitude: null as number | null,
    longitude: null as number | null,
    is_default: false
  })

  const resetForm = () => {
    setFormData({
      address_line1: '',
      address_line2: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      delivery_notes: '',
      latitude: null,
      longitude: null,
      is_default: false
    })
    setEditingAddress(null)
  }

  useEffect(() => {
    if (editingAddress) {
      setFormData({
        address_line1: editingAddress.address_line1,
        address_line2: editingAddress.address_line2 || '',
        landmark: editingAddress.landmark || '',
        city: editingAddress.city,
        state: editingAddress.state,
        pincode: editingAddress.pincode,
        delivery_notes: editingAddress.delivery_notes || '',
        latitude: editingAddress.latitude,
        longitude: editingAddress.longitude,
        is_default: editingAddress.is_default
      })
      setShowForm(true)
    } else {
      resetForm()
    }
  }, [editingAddress])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingAddress) {
        await onUpdateAddress(editingAddress.id, formData)
      } else {
        await onAddAddress(formData)
      }
      
      setShowForm(false)
      resetForm()
    } catch (error) {
      console.error('Error saving address:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }))
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Unable to get your location. Please enter address manually.')
        }
      )
    } else {
      alert('Geolocation is not supported by your browser.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-orange-800 flex items-center">
          <MapPin className="w-6 h-6 mr-2" />
          Delivery Addresses
        </h2>
        <button
          onClick={() => {
            setEditingAddress(null)
            setShowForm(true)
          }}
          className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Address
        </button>
      </div>

      {/* Address Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h3>
            <button
              onClick={() => {
                setShowForm(false)
                resetForm()
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address_line1}
                  onChange={(e) => setFormData(prev => ({ ...prev, address_line1: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Street address, house number, etc."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 2
                </label>
                <input
                  type="text"
                  value={formData.address_line2}
                  onChange={(e) => setFormData(prev => ({ ...prev, address_line2: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Apartment, suite, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Landmark
                </label>
                <input
                  type="text"
                  value={formData.landmark}
                  onChange={(e) => setFormData(prev => ({ ...prev, landmark: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Nearby landmark"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="State"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PIN Code *
                </label>
                <input
                  type="text"
                  required
                  pattern="[0-9]{6}"
                  value={formData.pincode}
                  onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="6-digit PIN code"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Notes
                </label>
                <textarea
                  value={formData.delivery_notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, delivery_notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  rows={2}
                  placeholder="Special delivery instructions"
                />
              </div>
            </div>

            {/* GPS Location */}
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <Navigation className="w-5 h-5 text-orange-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">GPS Location</p>
                <p className="text-xs text-gray-500">
                  {formData.latitude && formData.longitude 
                    ? `Lat: ${formData.latitude.toFixed(6)}, Lng: ${formData.longitude.toFixed(6)}`
                    : 'No location captured'
                  }
                </p>
              </div>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
              >
                Get Location
              </button>
            </div>

            {/* Default Address */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_default"
                checked={formData.is_default}
                onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="is_default" className="ml-2 text-sm text-gray-700">
                Set as default delivery address
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  resetForm()
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : (editingAddress ? 'Update Address' : 'Add Address')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address List */}
      {addresses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses yet</h3>
          <p className="text-gray-500 mb-4">Add your first delivery address to get started</p>
          <button
            onClick={() => {
              setEditingAddress(null)
              setShowForm(true)
            }}
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div key={address.id} className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    {address.is_default && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full mr-2">
                        <Home className="w-3 h-3 mr-1" />
                        Default
                      </span>
                    )}
                    <h3 className="font-medium text-gray-900">
                      {address.address_line1}
                    </h3>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    {address.address_line2 && <p>{address.address_line2}</p>}
                    {address.landmark && <p>Landmark: {address.landmark}</p>}
                    <p>{address.city}, {address.state} - {address.pincode}</p>
                    {address.delivery_notes && <p className="text-orange-600">Notes: {address.delivery_notes}</p>}
                    {address.latitude && address.longitude && (
                      <p className="text-xs text-gray-500">
                        📍 GPS: {address.latitude.toFixed(6)}, {address.longitude.toFixed(6)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {!address.is_default && (
                    <button
                      onClick={() => onSetDefault(address.id)}
                      className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Set as default"
                    >
                      <Home className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setEditingAddress(address)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit address"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteAddress(address.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
