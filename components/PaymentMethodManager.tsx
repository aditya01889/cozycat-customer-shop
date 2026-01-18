'use client'

import { useState, useEffect } from 'react'
import { CreditCard, Plus, Trash2, Edit2, Check, X, Shield, Smartphone } from 'lucide-react'

interface PaymentMethod {
  id: string
  type: 'card' | 'upi' | 'wallet'
  provider: string
  last_four?: string
  brand?: string
  expiry_month?: number
  expiry_year?: number
  upi_id?: string
  wallet_name?: string
  is_default: boolean
  created_at: string
}

interface PaymentMethodManagerProps {
  paymentMethods: PaymentMethod[]
  onAddPaymentMethod: (method: Omit<PaymentMethod, 'id' | 'created_at'>) => Promise<void>
  onUpdatePaymentMethod: (id: string, method: Partial<PaymentMethod>) => Promise<void>
  onDeletePaymentMethod: (id: string) => Promise<void>
  onSetDefault: (id: string) => Promise<void>
}

export default function PaymentMethodManager({
  paymentMethods,
  onAddPaymentMethod,
  onUpdatePaymentMethod,
  onDeletePaymentMethod,
  onSetDefault
}: PaymentMethodManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null)
  const [loading, setLoading] = useState(false)
  const [paymentType, setPaymentType] = useState<'card' | 'upi' | 'wallet'>('card')

  const [formData, setFormData] = useState({
    type: 'card' as 'card' | 'upi' | 'wallet',
    provider: '',
    last_four: '',
    brand: '',
    expiry_month: 0,
    expiry_year: 0,
    upi_id: '',
    wallet_name: '',
    is_default: false
  })

  const resetForm = () => {
    setFormData({
      type: 'card',
      provider: '',
      last_four: '',
      brand: '',
      expiry_month: 0,
      expiry_year: 0,
      upi_id: '',
      wallet_name: '',
      is_default: false
    })
    setPaymentType('card')
    setEditingMethod(null)
  }

  useEffect(() => {
    if (editingMethod) {
      setFormData({
        type: editingMethod.type,
        provider: editingMethod.provider,
        last_four: editingMethod.last_four || '',
        brand: editingMethod.brand || '',
        expiry_month: editingMethod.expiry_month || 0,
        expiry_year: editingMethod.expiry_year || 0,
        upi_id: editingMethod.upi_id || '',
        wallet_name: editingMethod.wallet_name || '',
        is_default: editingMethod.is_default
      })
      setPaymentType(editingMethod.type)
      setShowForm(true)
    } else {
      resetForm()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const methodData = {
        ...formData,
        type: paymentType
      }

      console.log('Payment method data being sent:', methodData)

      if (editingMethod) {
        await onUpdatePaymentMethod(editingMethod.id, methodData)
      } else {
        await onAddPaymentMethod(methodData)
      }
      
      setShowForm(false)
      resetForm()
    } catch (error) {
      console.error('Error saving payment method:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'card':
        return <CreditCard className="w-5 h-5" />
      case 'upi':
        return <Smartphone className="w-5 h-5" />
      case 'wallet':
        return <Shield className="w-5 h-5" />
      default:
        return <CreditCard className="w-5 h-5" />
    }
  }

  const getPaymentDisplay = (method: PaymentMethod) => {
    switch (method.type) {
      case 'card':
        return (
          <div className="flex items-center">
            <span className="text-lg font-bold mr-2">{method.brand || 'CARD'}</span>
            <span className="text-gray-600">•••• {method.last_four}</span>
            {method.expiry_month && method.expiry_year && (
              <span className="text-sm text-gray-500 ml-2">
                Expires {method.expiry_month}/{method.expiry_year}
              </span>
            )}
          </div>
        )
      case 'upi':
        return (
          <div className="flex items-center">
            <span className="text-lg font-bold mr-2">UPI</span>
            <span className="text-gray-600">{method.upi_id}</span>
          </div>
        )
      case 'wallet':
        return (
          <div className="flex items-center">
            <span className="text-lg font-bold mr-2">{method.wallet_name}</span>
            <span className="text-sm text-gray-600">({method.provider})</span>
          </div>
        )
      default:
        return <span className="text-gray-600">{method.provider}</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <CreditCard className="w-5 h-5 mr-2 text-orange-500" />
          Payment Methods
        </h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Payment Method
        </button>
      </div>

      {/* Payment Method Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
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
              {/* Payment Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Type *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'card', label: 'Credit/Debit Card', icon: <CreditCard className="w-4 h-4" /> },
                    { value: 'upi', label: 'UPI', icon: <Smartphone className="w-4 h-4" /> },
                    { value: 'wallet', label: 'Wallet', icon: <Shield className="w-4 h-4" /> }
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setPaymentType(type.value as any)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        paymentType === type.value
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-300 hover:border-gray-400 text-gray-700'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        {type.icon}
                        <span className="text-xs font-medium">{type.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Fields */}
              {paymentType === 'card' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Provider *
                    </label>
                    <select
                      value={formData.provider}
                      onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    >
                      <option value="">Select provider</option>
                      <option value="visa">Visa</option>
                      <option value="mastercard">Mastercard</option>
                      <option value="rupay">RuPay</option>
                      <option value="amex">American Express</option>
                      <option value="discover">Discover</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Month *
                      </label>
                      <select
                        value={formData.expiry_month}
                        onChange={(e) => setFormData(prev => ({ ...prev, expiry_month: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      >
                        <option value="">Month</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                          <option key={month} value={month}>
                            {month.toString().padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Year *
                      </label>
                      <select
                        value={formData.expiry_year}
                        onChange={(e) => setFormData(prev => ({ ...prev, expiry_year: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      >
                        <option value="">Year</option>
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* UPI Fields */}
              {paymentType === 'upi' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      UPI Provider *
                    </label>
                    <select
                      value={formData.provider}
                      onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    >
                      <option value="">Select UPI provider</option>
                      <option value="googlepay">Google Pay</option>
                      <option value="phonepe">PhonePe</option>
                      <option value="paytm">Paytm</option>
                      <option value="bhim">BHIM</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      UPI ID *
                    </label>
                    <input
                      type="text"
                      value={formData.upi_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, upi_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="your-upi-id@bank"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Wallet Fields */}
              {paymentType === 'wallet' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Wallet Name *
                    </label>
                    <select
                      value={formData.wallet_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, wallet_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    >
                      <option value="">Select wallet</option>
                      <option value="Paytm">Paytm</option>
                      <option value="PhonePe">PhonePe</option>
                      <option value="Google Pay">Google Pay</option>
                      <option value="Amazon Pay">Amazon Pay</option>
                      <option value="Mobikwik">Mobikwik</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Wallet Number/ID *
                    </label>
                    <input
                      type="text"
                      value={formData.provider}
                      onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Phone number or wallet ID"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Default Payment Method */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Set as default payment method</span>
                </label>
              </div>

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
                      {editingMethod ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      {editingMethod ? 'Update Payment Method' : 'Add Payment Method'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Methods List */}
      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`bg-white rounded-xl shadow-md p-6 border-2 transition-all ${
              method.is_default ? 'border-orange-500' : 'border-transparent'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <div className="mr-4 text-orange-500">
                  {getPaymentIcon(method.type)}
                </div>
                <div className="flex-1">
                  {getPaymentDisplay(method)}
                  {method.is_default && (
                    <div className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium mt-2">
                      Default
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 ml-4">
                {!method.is_default && (
                  <button
                    onClick={() => onSetDefault(method.id)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Set as default"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setEditingMethod(method)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit payment method"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeletePaymentMethod(method.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete payment method"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {paymentMethods.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">No payment methods saved</h3>
            <p className="text-gray-600 mb-4">
              Add your payment methods to make checkout faster!
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Payment Method
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
