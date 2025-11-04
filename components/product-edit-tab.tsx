"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Edit2, Check, X } from "lucide-react"
import type { Product } from "@/types"
import { storage } from "@/lib/storage"

export function ProductEditTab() {
  const [products, setProducts] = useState<Product[]>([])
  const [newProduct, setNewProduct] = useState({ name: "", price: "" })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: "", price: "" })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setIsLoading(true)
    const data = await storage.getProducts()
    setProducts(data)
    setIsLoading(false)
  }

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) return

    const product = await storage.addProduct({
      name: newProduct.name,
      price: Number.parseFloat(newProduct.price),
    })

    if (product) {
      setProducts([...products, product])
      setNewProduct({ name: "", price: "" })
    }
  }

  const handleDeleteProduct = async (id: string) => {
    const success = await storage.deleteProduct(id)
    if (success) {
      setProducts(products.filter((p) => p.id !== id))
    }
  }

  const startEdit = (product: Product) => {
    setEditingId(product.id)
    setEditForm({ name: product.name, price: product.price.toString() })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({ name: "", price: "" })
  }

  const saveEdit = async (id: string) => {
    if (!editForm.name || !editForm.price) return

    const success = await storage.updateProduct(id, {
      name: editForm.name,
      price: Number.parseFloat(editForm.price),
    })

    if (success) {
      setProducts(
        products.map((p) =>
          p.id === id ? { ...p, name: editForm.name, price: Number.parseFloat(editForm.price) } : p,
        ),
      )
      setEditingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>新しい商品を追加</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Input
              placeholder="商品名"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="flex-1"
            />
            <Input
              type="number"
              placeholder="料金"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              className="w-full sm:w-32"
            />
            <Button onClick={handleAddProduct} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              追加
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>商品一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">読み込み中...</p>
          ) : products.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">商品がありません。上記から追加してください。</p>
          ) : (
            <div className="space-y-2">
              {products.map((product) => (
                <div key={product.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  {editingId === product.id ? (
                    <>
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                        className="w-32"
                      />
                      <Button size="icon" variant="ghost" onClick={() => saveEdit(product.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={cancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <p className="font-medium">{product.name}</p>
                      </div>
                      <div className="text-right font-mono font-semibold">¥{product.price.toLocaleString()}</div>
                      <Button size="icon" variant="ghost" onClick={() => startEdit(product)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDeleteProduct(product.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
