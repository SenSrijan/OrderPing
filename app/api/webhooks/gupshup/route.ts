import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle delivery receipt (DLR)
    if (body.type === 'message-event' && body.payload?.type === 'delivered') {
      const messageId = body.payload.id
      
      await supabase
        .from('message_outbox')
        .update({ status: 'DELIVERED' })
        .eq('provider_message_id', messageId)
    }
    
    // Handle incoming message (STOP/opt-out)
    if (body.type === 'message' && body.payload?.type === 'text') {
      const message = body.payload.text?.toLowerCase()
      const fromNumber = body.payload.source
      
      if (message?.includes('stop') || message?.includes('unsubscribe')) {
        await supabase
          .from('customers')
          .update({ opted_out_at: new Date().toISOString() })
          .eq('whatsapp_number', fromNumber)
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Gupshup webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}