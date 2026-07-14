"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingUp, TrendingDown, Package, Factory, Receipt } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface PnLData {
  period: string
  type: string
  revenue: number
  cogs: number
  grossProfit: number
  grossMargin: number
  expenses: Record<string, number>
  totalExpenses: number
  netProfit: number
  netMargin: number
  monthlyData: { month: string; revenue: number; cogs: number; expenses: number; profit: number }[]
  orderCount: number
  expenseCount: number
  manufacturing?: {
    rawMaterials: number
    packaging: number
    labor: number
    overhead: number
    depreciation: number
    other: number
    totalProductionCosts: number
  }
  productProfitability?: Array<{
    name: string
    revenue: number
    cogs: number
    quantity: number
    profit: number
    margin: number
  }>
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

export default function ManufacturingFinancePage() {
  const [data, setData] = useState<PnLData | null>(null)
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("year")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/reports/profit-loss?type=manufacturing&period=${period}`)
      .then((res) => res.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [period])

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading financial data...</p>
      </div>
    )
  }

  const mfg = data.manufacturing

  const summaryCards = [
    { title: "Revenue", value: formatCurrency(data.revenue), icon: TrendingUp, description: `${data.orderCount} sales orders`, color: "text-emerald-600" },
    { title: "Cost of Goods Sold", value: formatCurrency(data.cogs), icon: Package, description: "Direct costs from sales", color: "text-red-600" },
    { title: "Gross Profit", value: formatCurrency(data.grossProfit), icon: DollarSign, description: formatPercent(data.grossMargin) + " margin", color: data.grossProfit >= 0 ? "text-emerald-600" : "text-red-600" },
    { title: "Net Profit", value: formatCurrency(data.netProfit), icon: data.netProfit >= 0 ? TrendingUp : TrendingDown, description: formatPercent(data.netMargin) + " margin", color: data.netProfit >= 0 ? "text-emerald-600" : "text-red-600" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manufacturing Finance</h1>
          <p className="text-muted-foreground">Profit & Loss Statement</p>
        </div>
        <div className="flex gap-2">
          {(["month", "quarter", "year"] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1 rounded text-sm ${period === p ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              {p === "month" ? "This Month" : p === "quarter" ? "This Quarter" : "This Year"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {data.monthlyData && data.monthlyData.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Monthly Performance</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                <Bar dataKey="cogs" fill="#ef4444" name="COGS" />
                <Bar dataKey="expenses" fill="#f59e0b" name="Expenses" />
                <Bar dataKey="profit" fill="#3b82f6" name="Net Profit" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Income Statement</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between"><span>Revenue</span><span className="font-medium">{formatCurrency(data.revenue)}</span></div>
              <div className="flex justify-between border-t pt-2"><span>Cost of Goods Sold</span><span className="font-medium text-red-600">({formatCurrency(data.cogs)})</span></div>
              <div className="flex justify-between border-t pt-2 font-semibold"><span>Gross Profit</span><span>{formatCurrency(data.grossProfit)} ({formatPercent(data.grossMargin)})</span></div>
              <div className="border-t pt-2 mt-2">
                <p className="text-sm font-medium mb-2">Operating Expenses</p>
                {Object.entries(data.expenses).map(([cat, amount]) => (
                  <div key={cat} className="flex justify-between text-sm ml-4"><span>{cat}</span><span>({formatCurrency(amount)})</span></div>
                ))}
                <div className="flex justify-between text-sm ml-4 mt-1 font-medium"><span>Total OpEx</span><span>({formatCurrency(data.totalExpenses)})</span></div>
              </div>
              <div className="flex justify-between border-t pt-2 font-bold text-lg"><span>Net Profit</span><span className={data.netProfit >= 0 ? "text-emerald-600" : "text-red-600"}>{formatCurrency(data.netProfit)} ({formatPercent(data.netMargin)})</span></div>
            </div>
          </CardContent>
        </Card>

        {mfg && (
          <Card>
            <CardHeader><CardTitle>Production Cost Breakdown</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between"><span>Raw Materials</span><span className="font-medium">{formatCurrency(mfg.rawMaterials)}</span></div>
                <div className="flex justify-between"><span>Packaging</span><span className="font-medium">{formatCurrency(mfg.packaging)}</span></div>
                <div className="flex justify-between"><span>Labor</span><span className="font-medium">{formatCurrency(mfg.labor)}</span></div>
                <div className="flex justify-between"><span>Overhead</span><span className="font-medium">{formatCurrency(mfg.overhead)}</span></div>
                <div className="flex justify-between"><span>Depreciation</span><span className="font-medium">{formatCurrency(mfg.depreciation)}</span></div>
                {mfg.other > 0 && <div className="flex justify-between"><span>Other</span><span className="font-medium">{formatCurrency(mfg.other)}</span></div>}
                <div className="flex justify-between border-t pt-2 font-semibold"><span>Total Production Costs</span><span>{formatCurrency(mfg.totalProductionCosts)}</span></div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {data.productProfitability && data.productProfitability.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Product Profitability</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty Sold</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>COGS + Prod. Cost</TableHead>
                  <TableHead>Profit</TableHead>
                  <TableHead>Margin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.productProfitability.map((p) => (
                  <TableRow key={p.name}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.quantity}</TableCell>
                    <TableCell>{formatCurrency(p.revenue)}</TableCell>
                    <TableCell>{formatCurrency(p.cogs)}</TableCell>
                    <TableCell className={p.profit >= 0 ? "text-emerald-600" : "text-red-600"}>{formatCurrency(p.profit)}</TableCell>
                    <TableCell><Badge variant={p.margin >= 20 ? "success" : p.margin >= 0 ? "warning" : "destructive"}>{formatPercent(p.margin)}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
