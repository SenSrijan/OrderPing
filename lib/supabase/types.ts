export type OrderStatus = 'RECEIVED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
export type MessageStatus = 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED'
export type TemplateCode = 'ORDER_RECEIVED' | 'STATUS_UPDATE' | 'DELIVERED_THANKS'
export type ReminderType = 'overdue_status' | 'feedback_after_delivery'
export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer'

export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  active_workspace_id: string | null
  created_at: string
}

export interface Workspace {
  id: string
  name: string
  slug: string
  owner_user_id: string
  whatsapp_provider: 'gupshup' | 'meta' | '360dialog'
  waba_business_account_id: string | null
  waba_phone_number_id: string | null
  provider_api_key: string | null
  provider_api_secret: string | null
  is_sandbox: boolean
  created_at: string
}

export interface Customer {
  id: string
  workspace_id: string
  name: string
  whatsapp_number: string
  last_optin_at: string | null
  opted_out_at: string | null
  last_message_at: string | null
  created_at: string
}

export interface Order {
  id: string
  workspace_id: string
  customer_id: string
  order_number: string
  product_title: string
  product_sku: string | null
  quantity: number
  price_paise: number
  shipping_name: string | null
  shipping_address: string | null
  pincode: string | null
  city: string | null
  state: string | null
  expected_delivery_date: string | null
  status: OrderStatus
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface OrderEvent {
  id: string
  order_id: string
  from_status: OrderStatus | null
  to_status: OrderStatus
  note: string | null
  created_by: string | null
  created_at: string
}

export interface MessageTemplate {
  id: string
  workspace_id: string
  code: TemplateCode
  provider_template_id: string
  lang: string
  active: boolean
}

export interface MessageOutbox {
  id: string
  workspace_id: string
  order_id: string | null
  customer_id: string | null
  template_code: TemplateCode
  payload_json: Record<string, any>
  destination: string | null
  provider_message_id: string | null
  status: MessageStatus
  error_code: string | null
  attempts: number
  last_attempt_at: string | null
  created_at: string
}