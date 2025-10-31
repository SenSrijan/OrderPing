import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function verifySignature(body: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex')
  
  return signature === expectedSignature
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')
    
    if (!signature || !verifySignature(body, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }
    
    const event = JSON.parse(body)
    
    // Handle subscription events
    if (event.event.startsWith('subscription.')) {
      const subscription = event.payload.subscription.entity
      const customerId = subscription.customer_id
      
      // Find workspace by Razorpay customer ID
      const { data: workspaceSubscription } = await supabase
        .from('subscriptions')
        .select('workspace_id')
        .eq('razorpay_customer_id', customerId)
        .single()
      
      if (workspaceSubscription) {
        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_end: new Date(subscription.current_end * 1000).toISOString(),
          })
          .eq('workspace_id', workspaceSubscription.workspace_id)
      }
    }
    
    // Handle invoice events
    if (event.event.startsWith('invoice.')) {
      const invoice = event.payload.invoice.entity
      const customerId = invoice.customer_id
      
      const { data: workspaceSubscription } = await supabase
        .from('subscriptions')
        .select('workspace_id')
        .eq('razorpay_customer_id', customerId)
        .single()
      
      if (workspaceSubscription) {
        await supabase
          .from('invoices')
          .upsert({
            workspace_id: workspaceSubscription.workspace_id,
            razorpay_invoice_id: invoice.id,
            amount_paise: invoice.amount,
            status: invoice.status,
            pdf_url: invoice.short_url,
            issued_at: new Date(invoice.issued_at * 1000).toISOString(),
          })
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Razorpay webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}