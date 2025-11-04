import { createClient } from "@/lib/supabase/client"
import type { Product, Sale } from "@/types"

export const storage = {
  getProducts: async (): Promise<Product[]> => {
    const supabase = createClient()
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching products:", error)
      return []
    }

    return data || []
  },

  saveProducts: async (products: Product[]) => {
    // This function is no longer used since we handle CRUD individually
    // Kept for compatibility but does nothing
  },

  addProduct: async (product: Omit<Product, "id">): Promise<Product | null> => {
    const supabase = createClient()
    const { data, error } = await supabase.from("products").insert([product]).select().single()

    if (error) {
      console.error("[v0] Error adding product:", error)
      return null
    }

    return data
  },

  updateProduct: async (id: string, updates: Partial<Product>): Promise<boolean> => {
    const supabase = createClient()
    const { error } = await supabase.from("products").update(updates).eq("id", id)

    if (error) {
      console.error("[v0] Error updating product:", error)
      return false
    }

    return true
  },

  deleteProduct: async (id: string): Promise<boolean> => {
    const supabase = createClient()
    const { error } = await supabase.from("products").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting product:", error)
      return false
    }

    return true
  },

  getSales: async (): Promise<Sale[]> => {
    const supabase = createClient()
    const { data, error } = await supabase.from("sales").select("*").order("created_at", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching sales:", error)
      return []
    }

    // Transform database records back to Sale format
    const salesMap = new Map<string, Sale>()

    data?.forEach((record) => {
      const saleId = record.id
      if (!salesMap.has(saleId)) {
        salesMap.set(saleId, {
          id: saleId,
          items: [],
          total: 0,
          timestamp: new Date(record.created_at).getTime(),
        })
      }

      const sale = salesMap.get(saleId)!
      const product: Product = {
        id: `${record.product_name}-${record.product_price}`,
        name: record.product_name,
        price: record.product_price,
      }

      sale.items.push({
        product,
        quantity: record.quantity,
      })

      sale.total += record.product_price * record.quantity
    })

    return Array.from(salesMap.values())
  },

  saveSale: async (sale: Sale): Promise<boolean> => {
    const supabase = createClient()

    // Insert each cart item as a separate sale record
    const salesRecords = sale.items.map((item) => ({
      product_name: item.product.name,
      product_price: item.product.price,
      quantity: item.quantity,
    }))

    const { error } = await supabase.from("sales").insert(salesRecords)

    if (error) {
      console.error("[v0] Error saving sale:", error)
      return false
    }

    return true
  },

  clearSales: async (): Promise<boolean> => {
    const supabase = createClient()
    const { error } = await supabase.from("sales").delete().neq("id", "00000000-0000-0000-0000-000000000000") // Delete all records

    if (error) {
      console.error("[v0] Error clearing sales:", error)
      return false
    }

    return true
  },
}
