import { requireWorkspace } from '@/lib/auth/guard'
import { createClient } from '@/lib/supabase/server'
import { StatusPill } from '@/components/status-pill'
import { EmptyState } from '@/components/empty-state'
import { formatCurrency, formatDate } from '@/lib/utils'
import { formatPhoneDisplay } from '@/lib/utils/phone'
import { Plus, Search } from 'lucide-react'
import Link from 'next/link'

interface OrdersPageProps {
  searchParams: Promise<{
    tab?: string
    q?: string
  }>
}

async function getOrders(workspaceId: string, tab?: string, query?: string) {
  const supabase = await createClient()
  
  let ordersQuery = supabase
    .from('orders')
    .select(`
      id,
      order_number,
      product_title,
      quantity,
      price_paise,
      status,
      expected_delivery_date,
      created_at,
      customers!inner(name, whatsapp_number)
    `)
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  // Apply status filter
  if (tab && tab !== 'all') {
    if (tab === 'overdue') {
      ordersQuery = ordersQuery
        .lt('expected_delivery_date', new Date().toISOString().split('T')[0])
        .neq('status', 'DELIVERED')
    } else {
      ordersQuery = ordersQuery.eq('status', tab.toUpperCase())
    }
  }

  // Apply search filter
  if (query) {
    ordersQuery = ordersQuery.or(`
      order_number.ilike.%${query}%,
      product_title.ilike.%${query}%,
      customers.name.ilike.%${query}%,
      customers.whatsapp_number.ilike.%${query}%
    `)
  }

  const { data: orders, error } = await ordersQuery

  if (error) throw error
  return orders || []
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const { workspaceId } = await requireWorkspace()
  const params = await searchParams
  const tab = params.tab || 'all'
  const query = params.q || ''
  
  const orders = await getOrders(workspaceId, tab, query)

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'received', label: 'Received' },
    { key: 'packed', label: 'Packed' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'overdue', label: 'Overdue' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Orders</h1>
        <Link
          href="/orders/new"
          className="inline-flex items-center px-4 py-2 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Order
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tabItem) => (
            <Link
              key={tabItem.key}
              href={`/orders?tab=${tabItem.key}${query ? `&q=${query}` : ''}`}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                tab === tabItem.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tabItem.label}
            </Link>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders, customers, or phone numbers..."
            defaultValue={query}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-2xl shadow-sm">
        {orders.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No orders found"
              description={query ? "Try adjusting your search terms" : "Get started by adding your first order"}
              action={
                <Link
                  href="/orders/new"
                  className="inline-flex items-center px-4 py-2 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Order
                </Link>
              }
            />
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ETA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-violet-600 hover:text-violet-700 font-medium"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{order.customers.name}</div>
                        <div className="text-sm text-gray-500">
                          {formatPhoneDisplay(order.customers.whatsapp_number)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{order.product_title}</div>
                      <div className="text-sm text-gray-500">Qty: {order.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusPill status={order.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.expected_delivery_date ? formatDate(order.expected_delivery_date) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(order.price_paise)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}