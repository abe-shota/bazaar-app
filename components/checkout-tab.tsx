"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Minus, Trash2, ShoppingCart } from "lucide-react"
import type { Product, CartItem, Sale } from "@/types"
import { storage } from "@/lib/storage"

export function CheckoutTab() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [payment, setPayment] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    const data = await storage.getProducts()
    setProducts(data)
  }

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const paymentAmount = Number.parseFloat(payment) || 0
  const change = paymentAmount - total

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product.id === product.id)
    if (existingItem) {
      setCart(cart.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)))
    } else {
      setCart([...cart, { product, quantity: 1 }])
    }
  }

  const incrementQuantity = (productId: string) => {
    setCart(cart.map((item) => (item.product.id === productId ? { ...item, quantity: item.quantity + 1 } : item)))
  }

  const decrementQuantity = (productId: string) => {
    setCart(
      cart
        .map((item) =>
          item.product.id === productId && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId))
  }

  const completeSale = async () => {
    if (cart.length === 0 || paymentAmount < total) return

    setIsLoading(true)

    const sale: Sale = {
      id: Date.now().toString(),
      items: cart,
      total,
      timestamp: Date.now(),
    }

    const success = await storage.saveSale(sale)

    if (success) {
      setCart([])
      setPayment("")
      await loadProducts()
    }

    setIsLoading(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Summary Section - Top */}
      <div className="space-y-4 mb-6">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg">合計</span>
                <span className="text-4xl font-bold font-mono">¥{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg">支払額</span>
                <Input
                  type="number"
                  placeholder="0"
                  value={payment}
                  onChange={(e) => setPayment(e.target.value)}
                  className="w-48 text-right text-2xl font-mono font-bold bg-primary-foreground text-primary border-0 h-12"
                />
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-primary-foreground/20">
                <span className="text-lg">おつり</span>
                <span className={`text-4xl font-bold font-mono ${change < 0 ? "text-destructive-foreground" : ""}`}>
                  ¥{change >= 0 ? change.toLocaleString() : "---"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={completeSale}
          disabled={cart.length === 0 || paymentAmount < total || isLoading}
          className="w-full h-14 text-lg"
          size="lg"
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          {isLoading ? "処理中..." : "会計を完了"}
        </Button>
      </div>

      {/* Cart Items */}
      {cart.length > 0 && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ¥{item.product.price.toLocaleString()} × {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline" onClick={() => decrementQuantity(item.product.id)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <Button size="icon" variant="outline" onClick={() => incrementQuantity(item.product.id)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => removeFromCart(item.product.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="text-right font-mono font-semibold min-w-24">
                    ¥{(item.product.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Buttons - Bottom */}
      <div className="mt-auto">
        <h3 className="text-lg font-semibold mb-3">商品を選択</h3>
        {products.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">商品がありません。商品編集タブから追加してください。</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <Button
                key={product.id}
                onClick={() => addToCart(product)}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2 text-base"
              >
                <span className="font-semibold text-balance text-center">{product.name}</span>
                <span className="font-mono font-bold">¥{product.price.toLocaleString()}</span>
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
