interface SendTemplateParams {
  to: string
  source: string
  templateId: string
  params: string[]
}

interface SendTextParams {
  to: string
  source: string
  text: string
}

interface GupshupResponse {
  providerMessageId?: string
  ok: boolean
  error?: string
}

export class GupshupProvider {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
  }

  async sendTemplate({ to, source, templateId, params }: SendTemplateParams): Promise<GupshupResponse> {
    try {
      const body = new URLSearchParams({
        channel: 'whatsapp',
        source,
        destination: to,
        message: JSON.stringify({
          type: 'template',
          template: {
            id: templateId,
            params
          }
        })
      })

      const response = await fetch(`${this.baseUrl}/msg`, {
        method: 'POST',
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          ok: false,
          error: data.message || `HTTP ${response.status}`
        }
      }

      return {
        ok: true,
        providerMessageId: data.messageId
      }
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async sendText({ to, source, text }: SendTextParams): Promise<GupshupResponse> {
    try {
      const body = new URLSearchParams({
        channel: 'whatsapp',
        source,
        destination: to,
        message: JSON.stringify({
          type: 'text',
          text
        })
      })

      const response = await fetch(`${this.baseUrl}/msg`, {
        method: 'POST',
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          ok: false,
          error: data.message || `HTTP ${response.status}`
        }
      }

      return {
        ok: true,
        providerMessageId: data.messageId
      }
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

export const gupshup = new GupshupProvider(
  process.env.GUPSHUP_API_KEY!,
  process.env.GUPSHUP_BASE_URL!
)