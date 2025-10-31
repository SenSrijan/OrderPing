import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Check if user has active workspace
  const { data: profile } = await supabase
    .from('profiles')
    .select('active_workspace_id')
    .eq('id', user.id)
    .single()

  if (!profile?.active_workspace_id) {
    // For now, redirect to sign-in until we implement onboarding
    redirect('/sign-in')
  }

  // Import and render dashboard content directly
  const { default: DashboardPage } = await import('./(dashboard)/page')
  return <DashboardPage />
}