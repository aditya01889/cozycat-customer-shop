'use client'

import { 
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Building,
  Calendar
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

interface VendorCardProps {
  vendor: Vendor
  onEdit: (vendor: Vendor) => void
  onDelete: (vendorId: string) => void
  onToggleStatus: (vendorId: string, isActive: boolean) => void
}

export default function VendorCard({
  vendor,
  onEdit,
  onDelete,
  onToggleStatus
}: VendorCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = () => {
    return vendor.is_active
      ? 'bg-green-50 border-green-200 text-green-800'
      : 'bg-gray-50 border-gray-200 text-gray-600'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Building className="h-8 w-8 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {vendor.name}
            </h3>
            {vendor.contact_person && (
              <p className="text-sm text-gray-500">
                Contact: {vendor.contact_person}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor()}`}>
            {vendor.is_active ? 'Active' : 'Inactive'}
          </span>
          
          <button
            onClick={() => onEdit(vendor)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(vendor.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-3 mb-4">
        {vendor.phone && (
          <div className="flex items-center space-x-2 text-sm">
            <Phone className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">{vendor.phone}</span>
          </div>
        )}
        
        {vendor.email && (
          <div className="flex items-center space-x-2 text-sm">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">{vendor.email}</span>
          </div>
        )}
        
        {vendor.address && (
          <div className="flex items-start space-x-2 text-sm">
            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
            <span className="text-gray-600">{vendor.address}</span>
          </div>
        )}
        
        {vendor.payment_terms && (
          <div className="text-sm">
            <span className="text-gray-500">Payment Terms: </span>
            <span className="text-gray-900 font-medium">{vendor.payment_terms}</span>
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>Created: {formatDate(vendor.created_at)}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>Last Order: {formatDate(vendor.last_order_date)}</span>
          </div>
        </div>
        
        <button
          onClick={() => onToggleStatus(vendor.id, !vendor.is_active)}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
            vendor.is_active
              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              : 'bg-green-100 text-green-800 hover:bg-green-200'
          }`}
        >
          {vendor.is_active ? 'Deactivate' : 'Activate'}
        </button>
      </div>
    </div>
  )
}
