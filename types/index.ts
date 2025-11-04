export interface Product {
  id: string
  name: string
  price: number
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Sale {
  id: string
  items: CartItem[]
  total: number
  timestamp: number
}
