import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { createRateLimiter } from '@/lib/middleware/rate-limiter'
import { createSecureHandler, preChecks } from '@/lib/api/secure-handler'

// Input validation schema
const getProductGroupIngredientsSchema = z.object({
  product_id: z.string().uuid('Invalid product ID format')
})

// Create rate limiter for this endpoint
const productGroupRateLimiter = createRateLimiter(60 * 60 * 1000, 20) // 20 requests per hour

async function handler(request: NextRequest, data: { product_id: string }) {
  try {
    const { product_id } = data
    
    // Create Supabase client
    const supabase = await createClient()

    // Get ingredient requirements for all orders with this product
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        order_items!inner(
          quantity,
          product_variants!inner(
            product_id,
            weight_grams,
            products!inner(
              ingredient_requirements!inner(
                ingredient_id,
                quantity_per_gram,
                ingredients!inner(
                  id,
                  name,
                  current_stock,
                  supplier_id
                )
              )
            )
          )
        )
      `)
      .eq('order_items.product_variants.product_id', product_id)
      .in('status', ['pending', 'confirmed', 'processing'])

    if (ordersError) {
      console.error('Error fetching orders:', ordersError)
      return NextResponse.json(
        { error: 'Failed to fetch orders for product' },
        { status: 500 }
      )
    }

    // Calculate ingredient requirements
    const ingredientMap = new Map()

    orders.forEach((order: any) => {
      order.order_items.forEach((item: any) => {
        const variant = item.product_variants
        const product = variant.products
        
        product.ingredient_requirements.forEach((req: any) => {
          const ingredient = req.ingredients
          const totalWeight = variant.weight_grams * item.quantity
          const requiredQty = req.quantity_per_gram * totalWeight
          const wasteQty = requiredQty * 0.075 // 7.5% waste
          const totalQty = requiredQty + wasteQty

          if (!ingredientMap.has(ingredient.id)) {
            ingredientMap.set(ingredient.id, {
              ingredient_id: ingredient.id,
              ingredient_name: ingredient.name,
              required_quantity: 0,
              waste_quantity: 0,
              total_quantity: 0,
              current_stock: ingredient.current_stock,
              stock_status: 'sufficient' as const,
              supplier_name: null,
              supplier_phone: null,
              supplier_email: null
            })
          }

          const existing = ingredientMap.get(ingredient.id)
          existing.required_quantity += requiredQty
          existing.waste_quantity += wasteQty
          existing.total_quantity += totalQty
        })
      })
    })

    // Get supplier information
    const ingredientIds = Array.from(ingredientMap.keys())
    if (ingredientIds.length > 0) {
      const { data: suppliers } = await supabase
        .from('ingredients')
        .select('id, suppliers!inner(name, phone, email)')
        .in('id', ingredientIds)

      suppliers?.forEach((item: any) => {
        const ingredient = ingredientMap.get(item.id)
        if (ingredient) {
          ingredient.supplier_name = item.suppliers.name
          ingredient.supplier_phone = item.suppliers.phone
          ingredient.supplier_email = item.suppliers.email
        }
      })
    }

    // Determine stock status
    ingredientMap.forEach((ingredient) => {
      if (ingredient.current_stock <= 0) {
        ingredient.stock_status = 'out_of_stock'
      } else if (ingredient.current_stock < ingredient.total_quantity) {
        ingredient.stock_status = 'insufficient'
      } else {
        ingredient.stock_status = 'sufficient'
      }
    })

    const ingredientRequirements = Array.from(ingredientMap.values()).sort((a, b) => {
      const statusOrder: { [key: string]: number } = { 'out_of_stock': 0, 'insufficient': 1, 'sufficient': 2 }
      return statusOrder[a.stock_status] - statusOrder[b.stock_status]
    })

    return NextResponse.json({
      success: true,
      ingredient_requirements: ingredientRequirements,
      fallback_used: true
    })

  } catch (error) {
    console.error('Error in get-product-group-ingredients:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Apply security middleware
export const POST = createSecureHandler({
  schema: getProductGroupIngredientsSchema,
  rateLimiter: productGroupRateLimiter,
  preCheck: preChecks.requireAdmin,
  handler: handler
})
