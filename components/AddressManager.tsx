'use client'

import { useState, useEffect } from 'react'
import { MapPin, Navigation, Plus, Trash2, Edit2, Home, Check, X } from 'lucide-react'
import { useToast } from '@/components/Toast/ToastProvider'
import { ErrorHandler, ErrorType } from '@/lib/errors/error-handler'

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

interface AddressManagerProps {
  addresses: Address[]
  onAddAddress: (address: Omit<Address, 'id'>) => Promise<void>
  onUpdateAddress: (id: string, address: Partial<Address>) => Promise<void>
  onDeleteAddress: (id: string) => Promise<void>
  onSetDefault: (id: string) => Promise<void>
}

export default function AddressManager({ 
  addresses, 
  onAddAddress, 
  onUpdateAddress, 
  onDeleteAddress, 
  onSetDefault 
}: AddressManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [loading, setLoading] = useState(false)
  const [getCurrentLocationLoading, setGetCurrentLocationLoading] = useState(false)
  const { showError, showSuccess } = useToast()

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

  const reverseGeocodeNominatim = async (latitude: number, longitude: number) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    })
    if (!response.ok) {
      throw new Error(`Reverse geocoding failed: ${response.status}`)
    }

    const data = await response.json()
    const addr = data?.address || {}

    const city = addr.city || addr.town || addr.village || addr.county || ''
    const state = addr.state || ''
    const pincode = addr.postcode || ''
    const addressLine1 = addr.road || addr.neighbourhood || addr.suburb || data?.display_name?.split(',')?.[0] || ''

    return {
      addressLine1,
      city,
      state,
      pincode
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      showError(
        ErrorHandler.createError(
          ErrorType.VALIDATION,
          'Location is not supported on this device/browser. Please enter address manually.',
          null,
          400,
          'address geolocation'
        )
      )
      return
    }

    setGetCurrentLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        setFormData(prev => ({
          ...prev,
          latitude,
          longitude
        }))

        try {
          const resolved = await reverseGeocodeNominatim(latitude, longitude)
          setFormData(prev => ({
            ...prev,
            address_line1: resolved.addressLine1 || prev.address_line1,
            city: resolved.city || prev.city,
            state: resolved.state || prev.state,
            pincode: resolved.pincode || prev.pincode,
            latitude,
            longitude
          }))
        } catch (error) {
          console.error('Error reverse geocoding coordinates:', error)
        }

        showSuccess('Location captured. You can review/edit the address before saving.')
        setGetCurrentLocationLoading(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        setGetCurrentLocationLoading(false)

        const message =
          error.code === error.PERMISSION_DENIED
            ? 'Location permission was denied. Please enter address manually.'
            : error.code === error.POSITION_UNAVAILABLE
              ? 'Location is unavailable right now. Please try again or enter address manually.'
              : 'Unable to get your location. Please try again or enter address manually.'

        showError(
          ErrorHandler.createError(
            ErrorType.NETWORK,
            message,
            { code: error.code, message: error.message },
            400,
            'address geolocation'
          )
        )
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

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
      const appError = ErrorHandler.fromError(error)
      showError(appError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-orange-500" />
          Delivery Addresses
        </h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Address
        </button>
      </div>

      {/* Address Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false)
                  resetForm()
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Get Current Location Button */}
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <Navigation className="w-5 h-5 mr-2 text-blue-600" />
                  <span className="text-sm text-blue-800">Use current location</span>
                </div>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={getCurrentLocationLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center text-sm"
                >
                  {getCurrentLocationLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4 mr-2" />
                      Use My Location
                    </>
                  )}
                </button>
              </div>

              {/* Manual Address Fields */}
              <div className="grid md:grid-cols-2 gap-4">
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
                    placeholder="House number, street name"
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
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={formData.pincode}
                    onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="6-digit pincode"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Instructions
                  </label>
                  <textarea
                    value={formData.delivery_notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, delivery_notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Any special instructions for delivery..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_default}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Set as default address</span>
                  </label>
                </div>
              </div>

              {/* GPS Coordinates Display */}
              {(formData.latitude && formData.longitude) && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    📍 GPS Coordinates: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                  </p>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    resetForm()
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      {editingAddress ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      {editingAddress ? 'Update Address' : 'Add Address'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Addresses List */}
      <div className="space-y-4">
        {addresses.map((address) => (
          <div
            key={address.id}
            className={`bg-white rounded-xl shadow-md p-6 border-2 transition-all ${
              address.is_default ? 'border-orange-500' : 'border-transparent'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Default Badge */}
                {address.is_default && (
                  <div className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium mb-3">
                    <Home className="w-3 h-3 mr-1" />
                    Default Address
                  </div>
                )}

                {/* Address Details */}
                <div className="space-y-2">
                  <p className="font-medium text-gray-800">
                    {address.address_line1}
                    {address.address_line2 && `, ${address.address_line2}`}
                  </p>
                  {address.landmark && (
                    <p className="text-sm text-gray-600">📍 Near: {address.landmark}</p>
                  )}
                  <p className="text-sm text-gray-600">
                    {address.city}, {address.state} - {address.pincode}
                  </p>
                  {address.delivery_notes && (
                    <p className="text-sm text-gray-500 italic">
                      📝 {address.delivery_notes}
                    </p>
                  )}
                  {address.latitude && address.longitude && (
                    <p className="text-xs text-green-600">
                      📍 GPS: {address.latitude.toFixed(4)}, {address.longitude.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 ml-4">
                {!address.is_default && (
                  <button
                    onClick={() => onSetDefault(address.id)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
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

        {addresses.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">No addresses saved</h3>
            <p className="text-gray-600 mb-4">
              Add your delivery addresses to make checkout faster!
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Address
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
