'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { requireWorkspace } from '@/lib/auth/guard'
import { formatPhoneE164, validatePhoneE164 } from '@/lib/utils/phone'
import type { Database } from '@/lib/supabase/database.types'
import type { OrderStatus } from '@/lib/supabase/types'
import type { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js'

type Tables = Database['public']['Tables']
type TableName = keyof Tables
type Row<T extends TableName> = Tables[T]['Row']
type Insert<T extends TableName> = Tables[T]['Insert']
type Update<T extends TableName> = Tables[T]['Update']

type TypedSupabaseClient = SupabaseClient<Database>
type IdResponse = PostgrestSingleResponse<{ id: string }>

async function insertRecord<T extends TableName>(
  client: TypedSupabaseClient,
  table: T,
  data: Insert<T>
): Promise<PostgrestSingleResponse<Row<T>>> {
  return client.from(table).insert(data as any).select().single()
}

async function updateRecord<T extends TableName>(
  client: TypedSupabaseClient,
  table: T,
  data: Update<T>,
  match: Record<string, any>
): Promise<PostgrestSingleResponse<Row<T>>> {
  return client.from(table).update(data as any).match(match).select().single()
}

const createOrderSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  whatsappNumber: z.string().min(1, 'WhatsApp number is required'),
  productTitle: z.string().min(1, 'Product title is required'),
  productSku: z.string().nullable(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  pricePaise: z.number().min(0, 'Price must be non-negative'),
  shippingName: z.string().nullable(),
  shippingAddress: z.string().nullable(),
  pincode: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  expectedDeliveryDate: z.string().nullable(),
})

export async function createOrder(formData: FormData) {
  try {
    const { user, workspaceId, role } = await requireWorkspace()
    
    // Check if user has permission to create orders
    if (!['owner', 'admin', 'editor'].includes(role)) {
      throw new Error('You do not have permission to create orders')
    }
    
    const supabase: TypedSupabaseClient = await createClient()

    // Log all form fields and workspace info
    console.log('Form Data:', Object.fromEntries(formData.entries()))
    console.log('User:', user)
    console.log('Workspace ID:', workspaceId)

    const data = {
      customerName: formData.get('customerName')?.toString() || '',
      whatsappNumber: formData.get('whatsappNumber')?.toString() || '',
      productTitle: formData.get('productTitle')?.toString() || '',
      productSku: formData.get('productSku')?.toString() || null,
      quantity: parseInt(formData.get('quantity')?.toString() || '1', 10),
      pricePaise: Math.round((parseFloat(formData.get('price')?.toString() || '0') || 0) * 100),
      shippingName: formData.get('shippingName') as string || null,
      shippingAddress: formData.get('shippingAddress') as string || null,
      pincode: formData.get('pincode') as string || null,
      city: formData.get('city') as string || null,
      state: formData.get('state') as string || null,
      expectedDeliveryDate: formData.get('expectedDeliveryDate') as string || null,
    }

    const validation = createOrderSchema.safeParse(data)
    if (!validation.success) {
      throw new Error(validation.error.issues[0].message)
    }

    // Format and validate phone number
    const formattedPhone = formatPhoneE164(data.whatsappNumber)
    if (!validatePhoneE164(formattedPhone)) {
      throw new Error('Invalid WhatsApp number format')
    }

    // Check if customer exists, create if not
    // Check if customer exists, create if not
    const customerQuery: IdResponse = await supabase
      .from('customers')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('whatsapp_number', formattedPhone)
      .single()

    let customerId: string

    if (customerQuery.error && customerQuery.error.code !== 'PGRST116') {
      console.error('Customer lookup error:', customerQuery.error)
      throw new Error('Failed to check existing customer')
    }

    if (!customerQuery.data) {
      const customerData = {
        workspace_id: workspaceId,
        name: data.customerName,
        whatsapp_number: formattedPhone,
        last_optin_at: new Date().toISOString(),
      }

      const newCustomerQuery = await insertRecord(supabase, 'customers', customerData as Insert<'customers'>)

      if (newCustomerQuery.error || !newCustomerQuery.data) {
        console.error('Customer creation error:', newCustomerQuery.error)
        throw new Error('Failed to create customer')
      }

      customerId = newCustomerQuery.data.id
    } else {
      customerId = customerQuery.data.id
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now().toString().slice(-8)}`

    // Create order
    const newOrder: Insert<'orders'> = {
      workspace_id: workspaceId,
      customer_id: customerId,
      order_number: orderNumber,
      product_title: data.productTitle,
      product_sku: data.productSku,
      quantity: data.quantity,
      price_paise: data.pricePaise,
      shipping_name: data.shippingName,
      shipping_address: data.shippingAddress,
      pincode: data.pincode,
      city: data.city,
      state: data.state,
      expected_delivery_date: data.expectedDeliveryDate,
      status: 'RECEIVED' as const,
      created_by: user.id,
    }

      const orderResult = await insertRecord(supabase, 'orders', newOrder)

    if (orderResult.error || !orderResult.data) {
      console.error('Order creation error:', orderResult.error)
      throw new Error('Failed to create order')
    }

    revalidatePath('/orders')
    revalidatePath('/')
    redirect(`/orders/${orderResult.data.id}`)
  } catch (error) {
    console.error('Order creation failed:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('An unexpected error occurred')
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const { user, workspaceId } = await requireWorkspace()
  const supabase: TypedSupabaseClient = await createClient()

  const updateData: Update<'orders'> = {
    status,
    updated_at: new Date().toISOString(),
  } satisfies Tables['orders']['Update']

  const result = await updateRecord(supabase, 'orders', updateData, {
    id: orderId,
    workspace_id: workspaceId
  })

  if (result.error) throw result.error

  revalidatePath('/orders')
  revalidatePath(`/orders/${orderId}`)
  revalidatePath('/')
}