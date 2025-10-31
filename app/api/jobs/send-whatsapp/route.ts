import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { gupshup } from '@/lib/providers/whatsapp/gupshup'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Get oldest queued message
    const { data: messages, error } = await supabase
      .from('message_outbox')
      .select(`
        *,
        customers!inner(whatsapp_number, opted_out_at),
        message_templates!inner(provider_template_id),
        workspaces!inner(provider_api_key, waba_phone_number_id)
      `)
      .eq('status', 'QUEUED')
      .is('customers.opted_out_at', null)
      .order('created_at', { ascending: true })
      .limit(10)

    if (error || !messages?.length) {
      return NextResponse.json({ processed: 0 })
    }

    let processed = 0

    for (const message of messages) {
      try {
        // Build template parameters from payload
        const params = Object.values(message.payload_json as Record<string, any>)
          .map(value => String(value))

        // Send message via Gupshup
        const result = await gupshup.sendTemplate({
          to: message.customers.whatsapp_number,
          source: process.env.GUPSHUP_SOURCE_NUMBER!,
          templateId: message.message_templates.provider_template_id,
          params
        })

        // Update message status
        if (result.ok) {
          await supabase
            .from('message_outbox')
            .update({
              status: 'SENT',
              provider_message_id: result.providerMessageId,
              last_attempt_at: new Date().toISOString()
            })
            .eq('id', message.id)
        } else {
          await supabase
            .from('message_outbox')
            .update({
              status: 'FAILED',
              error_code: result.error,
              attempts: message.attempts + 1,
              last_attempt_at: new Date().toISOString()
            })
            .eq('id', message.id)
        }

        processed++
      } catch (error) {
        console.error(`Failed to send message ${message.id}:`, error)
        
        await supabase
          .from('message_outbox')
          .update({
            status: 'FAILED',
            error_code: error instanceof Error ? error.message : 'Unknown error',
            attempts: message.attempts + 1,
            last_attempt_at: new Date().toISOString()
          })
          .eq('id', message.id)
      }
    }

    return NextResponse.json({ processed })
  } catch (error) {
    console.error('WhatsApp job error:', error)
    return NextResponse.json(
      { error: 'Job processing failed' },
      { status: 500 }
    )
  }
}