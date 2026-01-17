import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Database } from '@/types/database'
import OrderTracking from '@/components/OrderTracking'

type Order = Database['public']['Tables']['orders']['Row'] & {
  order_items: Database['public']['Tables']['order_items']['Row'][]
  customer_info?: any
}

export default async function OrderTrackingPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ from?: string }>
}) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const supabase = await createClient()

  // Check where user came from
  const fromProfile = resolvedSearchParams.from === 'profile'
  const fromAdmin = resolvedSearchParams.from === 'admin'

  // Try to find order by order_number first, then by ID
  let order: Order | null = null
  
  // First try by order_number
  const { data: orderByNumber } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        product_variant:product_variants (
          *,
          product:products (name, image_url)
        )
      )
    `)
    .eq('order_number', resolvedParams.id)
    .single()

  if (orderByNumber) {
    order = orderByNumber
  } else {
    // Try by ID
    const { data: orderById } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          product_variant:product_variants (
            *,
            product:products (name, image_url)
          )
        )
      `)
      .eq('id', resolvedParams.id)
      .single()

    if (orderById) {
      order = orderById
    }
  }

  if (!order) {
    notFound()
  }

  return <OrderTracking order={order} fromProfile={fromProfile} fromAdmin={fromAdmin} />
}
