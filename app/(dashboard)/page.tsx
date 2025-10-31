import { requireWorkspace } from '@/lib/auth/guard'
import { createClient } from '@/lib/supabase/server'
import { KpiChip } from '@/components/kpi-chip'
import { Plus, Upload, MessageSquare, CreditCard } from 'lucide-react'
import Link from 'next/link'

async function getKpis(workspaceId: string) {
  const supabase = await createClient()
  
  const [
    { count: totalOrders },
    { count: overdueOrders },
    { count: todayDeliveries }
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .neq('status', 'DELIVERED'),
    
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .lt('expected_delivery_date', new Date().toISOString().split('T')[0])
      .neq('status', 'DELIVERED'),
    
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .eq('status', 'DELIVERED')
      .gte('updated_at', new Date().toISOString().split('T')[0])
  ])

  return {
    openOrders: totalOrders || 0,
    overdueOrders: overdueOrders || 0,
    todayDeliveries: todayDeliveries || 0,
  }
}

export default async function DashboardPage() {
  const { workspaceId } = await requireWorkspace()
  const kpis = await getKpis(workspaceId)

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiChip
          title="Open Orders"
          value={kpis.openOrders}
          delay={0}
        />
        <KpiChip
          title="Overdue"
          value={kpis.overdueOrders}
          delay={200}
          className="border-amber-200"
        />
        <KpiChip
          title="Today's Deliveries"
          value={kpis.todayDeliveries}
          delay={400}
          className="border-green-200"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/orders/new"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl hover:border-violet-300 hover:bg-violet-50 transition-colors group"
          >
            <div className="p-2 bg-violet-100 rounded-lg group-hover:bg-violet-200 transition-colors">
              <Plus className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <div className="font-medium">Add Order</div>
              <div className="text-sm text-gray-500">Create new order</div>
            </div>
          </Link>

          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors group">
            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <Upload className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="font-medium">Import CSV</div>
              <div className="text-sm text-gray-500">Bulk upload orders</div>
            </div>
          </button>

          <Link
            href="/settings"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-colors group"
          >
            <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <MessageSquare className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="font-medium">Templates</div>
              <div className="text-sm text-gray-500">Manage messages</div>
            </div>
          </Link>

          <Link
            href="/settings"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl hover:border-amber-300 hover:bg-amber-50 transition-colors group"
          >
            <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
              <CreditCard className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="font-medium">Billing</div>
              <div className="text-sm text-gray-500">Manage subscription</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Orders Preview */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Recent Orders</h2>
          <Link
            href="/orders"
            className="text-violet-600 hover:text-violet-700 font-medium text-sm"
          >
            View all →
          </Link>
        </div>
        <div className="text-center py-8 text-gray-500">
          <p>No recent orders to display</p>
          <Link
            href="/orders/new"
            className="inline-flex items-center mt-4 px-4 py-2 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add your first order
          </Link>
        </div>
      </div>
    </div>
  )
}