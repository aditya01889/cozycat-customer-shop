import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Database } from '@/types/database'
import ProductDetail from '@/components/ProductDetail'

type Product = Database['public']['Tables']['products']['Row'] & {
  product_variants: Database['public']['Tables']['product_variants']['Row'][]
  categories: Database['public']['Tables']['categories']['Row']
}

export default async function ProductPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      product_variants (*),
      categories (*)
    `)
    .eq('slug', resolvedParams.slug)
    .eq('is_active', true)
    .single()

  if (error || !product) {
    notFound()
  }

  return <ProductDetail product={product} />
}
