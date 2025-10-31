import { requireWorkspace } from '@/lib/auth/guard'
import { createClient } from '@/lib/supabase/server'
import { InstallPwaButton } from '@/components/install-pwa-button'
import Link from 'next/link'
import { Home, Package, Settings, LogOut } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, workspaceId } = await requireWorkspace()
  const supabase = await createClient()
  
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('name')
    .eq('id', workspaceId)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-primary text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold">OrderPing</h1>
              <span className="text-white/80">•</span>
              <span className="text-white/90">{workspace?.name}</span>
            </div>
            <div className="flex items-center space-x-4">
              <InstallPwaButton />
              <span className="text-sm text-white/80">{user.email}</span>
              <form action="/auth/signout" method="post">
                <button type="submit" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-[calc(100vh-4rem)]">
          <div className="p-4">
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Home className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/orders"
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Package className="h-5 w-5" />
                  <span>Orders</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/settings"
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}