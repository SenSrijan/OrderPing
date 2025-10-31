import { requireWorkspace } from '@/lib/auth/guard'
import { createClient } from '@/lib/supabase/server'
import { MessageSquare, CreditCard, Users, Smartphone } from 'lucide-react'

async function getWorkspaceSettings(workspaceId: string) {
  const supabase = await createClient()
  
  const [
    { data: workspace },
    { data: templates }
  ] = await Promise.all([
    supabase
      .from('workspaces')
      .select('*')
      .eq('id', workspaceId)
      .single(),
    supabase
      .from('message_templates')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('active', true)
  ])

  return { workspace, templates: templates || [] }
}

export default async function SettingsPage() {
  const { workspaceId } = await requireWorkspace()
  const { workspace, templates } = await getWorkspaceSettings(workspaceId)

  const tabs = [
    { id: 'whatsapp', label: 'WhatsApp', icon: Smartphone },
    { id: 'templates', label: 'Templates', icon: MessageSquare },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'team', label: 'Team', icon: Users },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-600">Manage your workspace configuration</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className="flex items-center space-x-2 py-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium"
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* WhatsApp Settings */}
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">WhatsApp Configuration</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600">
                  {workspace?.whatsapp_provider || 'Not configured'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source Number
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600">
                  {workspace?.waba_phone_number_id || 'Not configured'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Account ID
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600">
                  {workspace?.waba_business_account_id || 'Not configured'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Environment
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600">
                  {workspace?.is_sandbox ? 'Sandbox' : 'Production'}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">
                Update Configuration
              </button>
            </div>
          </div>

          {/* Templates */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Message Templates</h2>
            
            <div className="space-y-4">
              {templates.map((template: any) => (
                <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{template.code.replace('_', ' ')}</div>
                      <div className="text-sm text-gray-600">
                        Template ID: {template.provider_template_id}
                      </div>
                      <div className="text-sm text-gray-600">
                        Language: {template.lang}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-sm text-violet-600 hover:text-violet-700">
                        Edit
                      </button>
                      <button className="text-sm text-red-600 hover:text-red-700">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Add Template
              </button>
            </div>
          </div>

          {/* Billing */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Billing & Subscription</h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-blue-900">Free Trial</div>
                  <div className="text-sm text-blue-700">
                    You're currently on a free trial. Upgrade to continue using OrderPing after your trial ends.
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Upgrade Plan
                </button>
              </div>
            </div>
          </div>

          {/* Team */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Team Members</h2>
            
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Team management coming soon</p>
              <p className="text-sm">Invite team members and manage permissions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}