"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductEditTab } from "@/components/product-edit-tab"
import { CheckoutTab } from "@/components/checkout-tab"
import { SummaryTab } from "@/components/summary-tab"
import { ShoppingCart, Package, BarChart3 } from "lucide-react"

export default function BazaarApp() {
  const [activeTab, setActiveTab] = useState("checkout")

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto p-4 md:p-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-balance">バザー会計アプリ</h1>
          <p className="text-muted-foreground mt-1">商品管理・会計・売上集計</p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="checkout" className="flex flex-col gap-1 py-3">
              <ShoppingCart className="h-5 w-5" />
              <span className="text-sm">会計</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex flex-col gap-1 py-3">
              <Package className="h-5 w-5" />
              <span className="text-sm">商品編集</span>
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex flex-col gap-1 py-3">
              <BarChart3 className="h-5 w-5" />
              <span className="text-sm">総計</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="checkout" className="mt-0">
            <CheckoutTab key={activeTab === "checkout" ? "checkout-active" : "checkout-inactive"} />
          </TabsContent>

          <TabsContent value="products" className="mt-0">
            <ProductEditTab key={activeTab === "products" ? "products-active" : "products-inactive"} />
          </TabsContent>

          <TabsContent value="summary" className="mt-0">
            <SummaryTab key={activeTab === "summary" ? "summary-active" : "summary-inactive"} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
