export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          id: string
          workspace_id: string
          actor_user_id: string | null
          action: string
          target_type: string | null
          target_id: string | null
          meta_json: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          actor_user_id?: string | null
          action: string
          target_type?: string | null
          target_id?: string | null
          meta_json?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          actor_user_id?: string | null
          action?: string
          target_type?: string | null
          target_id?: string | null
          meta_json?: Json | null
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          active_workspace_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          active_workspace_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          phone?: string | null
          active_workspace_id?: string | null
          created_at?: string
        }
      }
      workspaces: {
        Row: {
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
        Insert: {
          id?: string
          name: string
          slug: string
          owner_user_id: string
          whatsapp_provider?: 'gupshup' | 'meta' | '360dialog'
          waba_business_account_id?: string | null
          waba_phone_number_id?: string | null
          provider_api_key?: string | null
          provider_api_secret?: string | null
          is_sandbox?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          owner_user_id?: string
          whatsapp_provider?: 'gupshup' | 'meta' | '360dialog'
          waba_business_account_id?: string | null
          waba_phone_number_id?: string | null
          provider_api_key?: string | null
          provider_api_secret?: string | null
          is_sandbox?: boolean
          created_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          workspace_id: string
          name: string
          whatsapp_number: string
          last_optin_at: string | null
          opted_out_at: string | null
          last_message_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          whatsapp_number: string
          last_optin_at?: string | null
          opted_out_at?: string | null
          last_message_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          name?: string
          whatsapp_number?: string
          last_optin_at?: string | null
          opted_out_at?: string | null
          last_message_at?: string | null
          created_at?: string
        }
      }
      orders: {
        Row: {
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
          status: Database['public']['Enums']['order_status']
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          customer_id: string
          order_number: string
          product_title: string
          product_sku?: string | null
          quantity: number
          price_paise: number
          shipping_name?: string | null
          shipping_address?: string | null
          pincode?: string | null
          city?: string | null
          state?: string | null
          expected_delivery_date?: string | null
          status?: Database['public']['Enums']['order_status']
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          customer_id?: string
          order_number?: string
          product_title?: string
          product_sku?: string | null
          quantity?: number
          price_paise?: number
          shipping_name?: string | null
          shipping_address?: string | null
          pincode?: string | null
          city?: string | null
          state?: string | null
          expected_delivery_date?: string | null
          status?: Database['public']['Enums']['order_status']
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          workspace_id: string
          razorpay_invoice_id: string | null
          amount_paise: number
          status: string | null
          pdf_url: string | null
          issued_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          razorpay_invoice_id?: string | null
          amount_paise: number
          status?: string | null
          pdf_url?: string | null
          issued_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          razorpay_invoice_id?: string | null
          amount_paise?: number
          status?: string | null
          pdf_url?: string | null
          issued_at?: string | null
          created_at?: string
        }
      }
      message_outbox: {
        Row: {
          id: string
          workspace_id: string
          order_id: string | null
          customer_id: string | null
          template_code: Database['public']['Enums']['template_code']
          payload_json: Json
          destination: string | null
          provider_message_id: string | null
          status: Database['public']['Enums']['message_status']
          error_code: string | null
          attempts: number
          last_attempt_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          order_id?: string | null
          customer_id?: string | null
          template_code: Database['public']['Enums']['template_code']
          payload_json: Json
          destination?: string | null
          provider_message_id?: string | null
          status?: Database['public']['Enums']['message_status']
          error_code?: string | null
          attempts?: number
          last_attempt_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          order_id?: string | null
          customer_id?: string | null
          template_code?: Database['public']['Enums']['template_code']
          payload_json?: Json
          destination?: string | null
          provider_message_id?: string | null
          status?: Database['public']['Enums']['message_status']
          error_code?: string | null
          attempts?: number
          last_attempt_at?: string | null
          created_at?: string
        }
      }
      message_templates: {
        Row: {
          id: string
          workspace_id: string
          code: Database['public']['Enums']['template_code']
          provider_template_id: string
          lang: string
          active: boolean
        }
        Insert: {
          id?: string
          workspace_id: string
          code: Database['public']['Enums']['template_code']
          provider_template_id: string
          lang?: string
          active?: boolean
        }
        Update: {
          id?: string
          workspace_id?: string
          code?: Database['public']['Enums']['template_code']
          provider_template_id?: string
          lang?: string
          active?: boolean
        }
      }
      order_events: {
        Row: {
          id: string
          order_id: string
          from_status: Database['public']['Enums']['order_status'] | null
          to_status: Database['public']['Enums']['order_status']
          note: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          from_status?: Database['public']['Enums']['order_status'] | null
          to_status: Database['public']['Enums']['order_status']
          note?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          from_status?: Database['public']['Enums']['order_status'] | null
          to_status?: Database['public']['Enums']['order_status']
          note?: string | null
          created_by?: string | null
          created_at?: string
        }
      }
      reminders: {
        Row: {
          id: string
          workspace_id: string
          order_id: string
          type: Database['public']['Enums']['reminder_type']
          scheduled_for: string
          sent_at: string | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          order_id: string
          type: Database['public']['Enums']['reminder_type']
          scheduled_for: string
          sent_at?: string | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          order_id?: string
          type?: Database['public']['Enums']['reminder_type']
          scheduled_for?: string
          sent_at?: string | null
          active?: boolean
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          workspace_id: string
          plan: string
          status: 'trialing' | 'active' | 'past_due' | 'cancelled'
          current_period_end: string | null
          razorpay_customer_id: string | null
          razorpay_subscription_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          plan?: string
          status?: 'trialing' | 'active' | 'past_due' | 'cancelled'
          current_period_end?: string | null
          razorpay_customer_id?: string | null
          razorpay_subscription_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          plan?: string
          status?: 'trialing' | 'active' | 'past_due' | 'cancelled'
          current_period_end?: string | null
          razorpay_customer_id?: string | null
          razorpay_subscription_id?: string | null
          created_at?: string
        }
      }
      workspace_members: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          role: 'owner' | 'admin' | 'editor' | 'viewer'
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          role: 'owner' | 'admin' | 'editor' | 'viewer'
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'editor' | 'viewer'
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_workspace_member: {
        Args: { p_workspace_id: string }
        Returns: boolean
      }
    }
    Enums: {
      order_status: 'RECEIVED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
      message_status: 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED'
      template_code: 'ORDER_RECEIVED' | 'STATUS_UPDATE' | 'DELIVERED_THANKS'
      reminder_type: 'overdue_status' | 'feedback_after_delivery'
    }
  }
}