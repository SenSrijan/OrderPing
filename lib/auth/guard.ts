import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { Profile, WorkspaceMember } from '@/lib/supabase/schema'

export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/sign-in')
  }

  return user
}

export async function requireWorkspace() {
  const user = await requireAuth()
  // Use an admin/service-role client for workspace membership/profile checks to
  // avoid RLS/policy recursion issues when evaluating membership server-side.
  const supabase = createAdminClient()
  
  console.log('Checking workspace for user:', user.id)
  
  // First check if user has any workspace memberships
  // Get workspace memberships
  const { data: memberships, error: membershipError } = await supabase
    .from('workspace_members')
    .select('workspace_id, role')
    .eq('user_id', user.id)
    .returns<Pick<WorkspaceMember, 'workspace_id' | 'role'>[]>()

  if (membershipError) {
    console.error('Membership check failed:', membershipError)
    throw new Error('Failed to verify workspace access')
  }

  if (!memberships?.length) {
    console.log('No workspace memberships found for user:', user.id)
    redirect('/onboarding')
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('active_workspace_id')
    .eq('id', user.id)
    .single<Pick<Profile, 'active_workspace_id'>>()

  if (profileError) {
    console.error('Profile fetch failed:', profileError)
    throw new Error('Failed to fetch user profile')
  }

  // Validate active workspace
  if (!profile?.active_workspace_id || 
      !memberships.some(m => m.workspace_id === profile.active_workspace_id)) {
    console.log('Invalid active workspace:', profile?.active_workspace_id)
    console.log('Available workspaces:', memberships.map(m => m.workspace_id))
    redirect('/onboarding')
  }

  // Get the role for the active workspace
  const activeWorkspace = memberships.find(
    m => m.workspace_id === profile.active_workspace_id
  )

  if (!activeWorkspace) {
    throw new Error('Failed to get workspace role')
  }

  return { 
    user, 
    workspaceId: profile.active_workspace_id,
    role: activeWorkspace.role
  }
}