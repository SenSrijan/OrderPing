import { requireWorkspace } from '@/lib/auth/guard'
import { createClient } from '@/lib/supabase/server'
import { updateOrderStatus } from '@/actions/orders'
import { StatusPill } from '@/components/status-pill'
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils'
import { formatPhoneDisplay } from '@/lib/utils/phone'
import { ArrowLeft, Package, User, MapPin, Calendar, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { OrderStatus } from '@/lib/supabase/types'

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

async function getOrderDetails(orderId: string, workspaceId: string) {
  const supabase = await createClient()
  
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      customers!inner(name, whatsapp_number),
      order_events(
        id,
        from_status,
        to_status,
        note,
        created_at,
        created_by
      )
    `)
    .eq('id', orderId)
    .eq('workspace_id', workspaceId)
    .single()

  if (error) return null
  return order
}

const statusSteps: OrderStatus[] = ['RECEIVED', 'PACKED', 'SHIPPED', 'DELIVERED']

function StatusStepper({ currentStatus, orderId }: { currentStatus: OrderStatus, orderId: string }) {
  const currentIndex = statusSteps.indexOf(currentStatus)
  
  return (
    <div className="flex items-center space-x-4">
      {statusSteps.map((status, index) => {
        const isActive = index <= currentIndex
        const isCurrent = status === currentStatus
        
        return (
          <div key={status} className="flex items-center">
            <form action={updateOrderStatus.bind(null, orderId, status)}>
              <button
                type="submit"
                disabled={index <= currentIndex}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                } ${isCurrent ? 'ring-4 ring-violet-200' : ''} disabled:cursor-not-allowed`}
              >
                {index + 1}
              </button>
            </form>
            <div className="ml-2 text-sm">
              <div className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </div>
            </div>
            {index < statusSteps.length - 1 && (
              <div className={`w-12 h-0.5 mx-4 ${
                index < currentIndex ? 'bg-violet-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { workspaceId } = await requireWorkspace()
  const { id } = await params
  
  const order = await getOrderDetails(id, workspaceId)
  
  if (!order) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/orders"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Order {order.order_number}</h1>
            <p className="text-gray-500">Created {formatRelativeTime(order.created_at)}</p>
          </div>
        </div>
        <StatusPill status={order.status} />
      </div>

      {/* Status Stepper */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-6">Order Progress</h2>
        <StatusStepper currentStatus={order.status} orderId={order.id} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Details */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <User className="h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-semibold">Customer</h3>
            </div>
            <div className="space-y-2">
              <div className="font-medium">{order.customers.name}</div>
              <div className="text-gray-600">{formatPhoneDisplay(order.customers.whatsapp_number)}</div>
            </div>
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Package className="h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-semibold">Product</h3>
            </div>
            <div className="space-y-2">
              <div className="font-medium">{order.product_title}</div>
              {order.product_sku && (
                <div className="text-sm text-gray-600">SKU: {order.product_sku}</div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Quantity: {order.quantity}</span>
                <span className="font-semibold">{formatCurrency(order.price_paise)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          {order.shipping_address && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center space-x-3 mb-4">
                <MapPin className="h-5 w-5 text-gray-400" />
                <h3 className="text-lg font-semibold">Shipping</h3>
              </div>
              <div className="space-y-2">
                {order.shipping_name && (
                  <div className="font-medium">{order.shipping_name}</div>
                )}
                <div className="text-gray-600 whitespace-pre-line">{order.shipping_address}</div>
                <div className="text-sm text-gray-600">
                  {[order.city, order.state, order.pincode].filter(Boolean).join(', ')}
                </div>
              </div>
            </div>
          )}

          {/* Delivery Info */}
          {order.expected_delivery_date && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Calendar className="h-5 w-5 text-gray-400" />
                <h3 className="text-lg font-semibold">Delivery</h3>
              </div>
              <div className="text-gray-600">
                Expected: {formatDate(order.expected_delivery_date)}
              </div>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-semibold">Timeline</h3>
            </div>
            <button className="text-sm text-violet-600 hover:text-violet-700 font-medium">
              Resend last message
            </button>
          </div>
          
          <div className="space-y-4">
            {order.order_events.map((event: any, index: number) => (
              <div key={event.id} className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-violet-600 rounded-full" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    {event.from_status ? (
                      <>Status changed from {event.from_status.toLowerCase()} to {event.to_status.toLowerCase()}</>
                    ) : (
                      <>Order {event.to_status.toLowerCase()}</>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatRelativeTime(event.created_at)}
                  </div>
                  {event.note && (
                    <div className="text-sm text-gray-600 mt-1">{event.note}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}