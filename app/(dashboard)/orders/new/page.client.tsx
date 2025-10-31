'use client'

import { createOrder } from '@/actions/orders'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewOrderPage() {
  // Default ETA is 5 days from now
  const defaultEta = new Date()
  defaultEta.setDate(defaultEta.getDate() + 5)
  const defaultEtaString = defaultEta.toISOString().split('T')[0]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href="/orders"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Add New Order</h1>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <form
          action={async (formData: FormData) => {
            try {
              await createOrder(formData)
            } catch (err) {
              if (err instanceof Error) {
                window.alert(err.message)
              }
            }
          }}
          className="space-y-6"
        >
          {/* Customer Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <label htmlFor="whatsappNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Number *
                </label>
                <input
                  type="tel"
                  id="whatsappNumber"
                  name="whatsappNumber"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="+91 9876543210"
                />
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Product Information</h2>
            
            <div>
              <label htmlFor="productTitle" className="block text-sm font-medium text-gray-700 mb-2">
                Product Title *
              </label>
              <input
                type="text"
                id="productTitle"
                name="productTitle"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="Enter product name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="productSku" className="block text-sm font-medium text-gray-700 mb-2">
                  SKU (Optional)
                </label>
                <input
                  type="text"
                  id="productSku"
                  name="productSku"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="SKU-001"
                />
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  required
                  min="1"
                  defaultValue="1"
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  defaultValue="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="499.00"
                />
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Shipping Information</h2>
            
            <div>
              <label htmlFor="shippingName" className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Name
              </label>
              <input
                type="text"
                id="shippingName"
                name="shippingName"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="Same as customer name"
              />
            </div>

            <div>
              <label htmlFor="shippingAddress" className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Address
              </label>
              <textarea
                id="shippingAddress"
                name="shippingAddress"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="Enter complete shipping address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="400001"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Mumbai"
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Maharashtra"
                />
              </div>
            </div>

            <div>
              <label htmlFor="expectedDeliveryDate" className="block text-sm font-medium text-gray-700 mb-2">
                Expected Delivery Date
              </label>
              <input
                type="date"
                id="expectedDeliveryDate"
                name="expectedDeliveryDate"
                defaultValue={defaultEtaString}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* Consent */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="consent"
              name="consent"
              required
              className="mt-1 h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
            />
            <label htmlFor="consent" className="text-sm text-gray-700">
              I confirm that the customer has consented to receive WhatsApp messages for order updates.
            </label>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/orders"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Create Order
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}