import type { Product, Sale } from "@/types"

const PRODUCTS_KEY = "bazaar_products"
const SALES_KEY = "bazaar_sales"

export const storage = {
  getProducts: (): Product[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(PRODUCTS_KEY)
    return data ? JSON.parse(data) : []
  },

  saveProducts: (products: Product[]) => {
    if (typeof window === "undefined") return
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products))
  },

  getSales: (): Sale[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(SALES_KEY)
    return data ? JSON.parse(data) : []
  },

  saveSale: (sale: Sale) => {
    if (typeof window === "undefined") return
    const sales = storage.getSales()
    sales.push(sale)
    localStorage.setItem(SALES_KEY, JSON.stringify(sales))
  },

  clearSales: () => {
    if (typeof window === "undefined") return
    localStorage.setItem(SALES_KEY, JSON.stringify([]))
  },
}
