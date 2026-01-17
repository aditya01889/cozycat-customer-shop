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
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          display_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          category_id: string | null
          name: string
          slug: string
          description: string | null
          short_description: string | null
          nutritional_info: Json | null
          ingredients_display: string | null
          image_url: string | null
          is_active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id?: string | null
          name: string
          slug: string
          description?: string | null
          short_description?: string | null
          nutritional_info?: Json | null
          ingredients_display?: string | null
          image_url?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string | null
          name?: string
          slug?: string
          description?: string | null
          short_description?: string | null
          nutritional_info?: Json | null
          ingredients_display?: string | null
          image_url?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          weight_grams: number
          price: number
          sku: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          weight_grams: number
          price: number
          sku?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          weight_grams?: number
          price?: number
          sku?: string | null
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string | null
          delivery_address_id: string | null
          status: 'pending' | 'confirmed' | 'ready_production' | 'in_production' | 'ready_delivery' | 'out_for_delivery' | 'delivered' | 'cancelled'
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_method: 'cod' | 'online' | 'wallet'
          subtotal: number
          delivery_fee: number
          discount_amount: number
          total_amount: number
          notes: string | null
          delivery_notes: string | null
          preferred_delivery_date: string | null
          actual_delivery_date: string | null
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          customer_id?: string | null
          delivery_address_id?: string | null
          status?: 'pending' | 'confirmed' | 'ready_production' | 'in_production' | 'ready_delivery' | 'out_for_delivery' | 'delivered' | 'cancelled'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_method?: 'cod' | 'online' | 'wallet'
          subtotal: number
          delivery_fee?: number
          discount_amount?: number
          total_amount: number
          notes?: string | null
          delivery_notes?: string | null
          preferred_delivery_date?: string | null
          actual_delivery_date?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          customer_id?: string | null
          delivery_address_id?: string | null
          status?: 'pending' | 'confirmed' | 'ready_production' | 'in_production' | 'ready_delivery' | 'out_for_delivery' | 'delivered' | 'cancelled'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_method?: 'cod' | 'online' | 'wallet'
          subtotal?: number
          delivery_fee?: number
          discount_amount?: number
          total_amount?: number
          notes?: string | null
          delivery_notes?: string | null
          preferred_delivery_date?: string | null
          actual_delivery_date?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          variant_id: string
          batch_id: string | null
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          variant_id: string
          batch_id?: string | null
          quantity: number
          unit_price: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          variant_id?: string
          batch_id?: string | null
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          user_id: string | null
          first_name: string
          last_name: string | null
          phone: string
          email: string | null
          whatsapp_number: string | null
          is_whatsapp_preferred: boolean
          notes: string | null
          total_orders: number
          total_spent: number
          first_order_date: string | null
          last_order_date: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          first_name: string
          last_name?: string | null
          phone: string
          email?: string | null
          whatsapp_number?: string | null
          is_whatsapp_preferred?: boolean
          notes?: string | null
          total_orders?: number
          total_spent?: number
          first_order_date?: string | null
          last_order_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          first_name?: string
          last_name?: string | null
          phone?: string
          email?: string | null
          whatsapp_number?: string | null
          is_whatsapp_preferred?: boolean
          notes?: string | null
          total_orders?: number
          total_spent?: number
          first_order_date?: string | null
          last_order_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      customer_addresses: {
        Row: {
          id: string
          customer_id: string
          address_line1: string
          address_line2: string | null
          landmark: string | null
          city: string
          state: string
          pincode: string
          latitude: number | null
          longitude: number | null
          is_default: boolean
          delivery_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          address_line1: string
          address_line2?: string | null
          landmark?: string | null
          city: string
          state: string
          pincode: string
          latitude?: number | null
          longitude?: number | null
          is_default?: boolean
          delivery_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          address_line1?: string
          address_line2?: string | null
          landmark?: string | null
          city?: string
          state?: string
          pincode?: string
          latitude?: number | null
          longitude?: number | null
          is_default?: boolean
          delivery_notes?: string | null
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          role: 'admin' | 'partner' | 'customer' | 'operations'
          full_name: string
          phone: string | null
          email: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          role: 'admin' | 'partner' | 'customer' | 'operations'
          full_name: string
          phone?: string | null
          email?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'admin' | 'partner' | 'customer' | 'operations'
          full_name?: string
          phone?: string | null
          email?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
