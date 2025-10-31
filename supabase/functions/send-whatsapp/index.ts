import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GupshupResponse {
  providerMessageId?: string
  ok: boolean
  error?: string
}

async function sendTemplate(apiKey: string, baseUrl: string, params: {
  to: string
  source: string
  templateId: string
  params: string[]
}): Promise<GupshupResponse> {
  try {
    const body = new URLSearchParams({
      channel: 'whatsapp',
      source: params.source,
      destination: params.to,
      message: JSON.stringify({
        type: 'template',
        template: {
          id: params.templateId,
          params: params.params
        }
      })
    })

    const response = await fetch(`${baseUrl}/msg`, {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    })

    const data = await response.json()

    if (!response.ok) {
      return { ok: false, error: data.message || `HTTP ${response.status}` }
    }

    return { ok: true, providerMessageId: data.messageId }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get oldest queued messages
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
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    let processed = 0

    for (const message of messages) {
      try {
        // Build template parameters from payload
        const params = Object.values(message.payload_json as Record<string, any>)
          .map(value => String(value))

        // Send message via Gupshup
        const result = await sendTemplate(
          Deno.env.get('GUPSHUP_API_KEY') ?? '',
          Deno.env.get('GUPSHUP_BASE_URL') ?? '',
          {
            to: message.customers.whatsapp_number,
            source: Deno.env.get('GUPSHUP_SOURCE_NUMBER') ?? '',
            templateId: message.message_templates.provider_template_id,
            params
          }
        )

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

    return new Response(JSON.stringify({ processed }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('WhatsApp job error:', error)
    return new Response(
      JSON.stringify({ error: 'Job processing failed' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})