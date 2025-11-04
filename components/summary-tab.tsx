"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"
import type { Sale, Product } from "@/types"
import { storage } from "@/lib/storage"

interface ProductSummary {
  product: Product
  totalQuantity: number
  totalRevenue: number
}

export function SummaryTab() {
  const [sales, setSales] = useState<Sale[]>([])
  const [summary, setSummary] = useState<ProductSummary[]>([])
  const [showResetDialog, setShowResetDialog] = useState(false)

  useEffect(() => {
    loadSales()
  }, [])

  const loadSales = () => {
    const loadedSales = storage.getSales()
    setSales(loadedSales)
    calculateSummary(loadedSales)
  }

  const calculateSummary = (salesData: Sale[]) => {
    const productMap = new Map<string, ProductSummary>()

    salesData.forEach((sale) => {
      sale.items.forEach((item) => {
        const existing = productMap.get(item.product.id)
        if (existing) {
          existing.totalQuantity += item.quantity
          existing.totalRevenue += item.product.price * item.quantity
        } else {
          productMap.set(item.product.id, {
            product: item.product,
            totalQuantity: item.quantity,
            totalRevenue: item.product.price * item.quantity,
          })
        }
      })
    })

    setSummary(Array.from(productMap.values()))
  }

  const handleResetClick = () => {
    setShowResetDialog(true)
  }

  const confirmReset = () => {
    storage.clearSales()
    loadSales()
    setShowResetDialog(false)
  }

  const totalRevenue = summary.reduce((sum, item) => sum + item.totalRevenue, 0)
  const totalItems = summary.reduce((sum, item) => sum + item.totalQuantity, 0)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">総売上</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">¥{totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">総販売数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{totalItems.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">取引回数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{sales.length.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>商品別売上</CardTitle>
          {sales.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleResetClick}>
              <Trash2 className="mr-2 h-4 w-4" />
              全データ削除
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {summary.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">売上データがありません。</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">商品名</th>
                    <th className="text-right py-3 px-4 font-semibold">数量</th>
                    <th className="text-right py-3 px-4 font-semibold">単価</th>
                    <th className="text-right py-3 px-4 font-semibold">売上</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.map((item) => (
                    <tr key={item.product.id} className="border-b">
                      <td className="py-3 px-4">{item.product.name}</td>
                      <td className="text-right py-3 px-4 font-mono">{item.totalQuantity}</td>
                      <td className="text-right py-3 px-4 font-mono">¥{item.product.price.toLocaleString()}</td>
                      <td className="text-right py-3 px-4 font-mono font-semibold">
                        ¥{item.totalRevenue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-bold">
                    <td className="py-3 px-4">合計</td>
                    <td className="text-right py-3 px-4 font-mono">{totalItems}</td>
                    <td className="text-right py-3 px-4">---</td>
                    <td className="text-right py-3 px-4 font-mono text-lg">¥{totalRevenue.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {sales.length > 0 && (
        <div className="flex justify-center pb-4">
          <Button variant="destructive" size="lg" onClick={handleResetClick} className="w-full max-w-md">
            <Trash2 className="mr-2 h-5 w-5" />
            売上データをリセット
          </Button>
        </div>
      )}

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>売上データの削除</AlertDialogTitle>
            <AlertDialogDescription className="text-base">本当によろしいですか？</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>いいえ</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReset}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              はい
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
