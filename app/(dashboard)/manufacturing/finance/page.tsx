"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Package,
  Factory,
  Receipt,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface PnLData {
  period: string
  revenue: { totalSales: number; salesOrderCount: number }
  cogs: {
    directCosts: number
    rawMaterials: number
    packaging: number
    total: number
  }
  grossProfit: number
  grossMargin: number
  operatingExpenses: {
    production: {
      overhead: number
      labor: number
      depreciation: number
      total: number
    }
    administrative: Record<string, number>
    totalAdminExpenses: number
    total: number
  }
  netProfit: number
  netMargin: number
  productProfitability: Array<{
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
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<PnLData | null>(null)
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (status !== "authenticated") return
    setLoading(true)
    fetch(`/api/reports/profit-loss?type=manufacturing&period=${period}`)
      .then((res) => res.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [period, status])

  if (status === "loading" || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const summaryCards = [
    {
      title: "Revenue",
      value: formatCurrency(data.revenue.totalSales),
      icon: TrendingUp,
      description: `${data.revenue.salesOrderCount} sales orders`,
      color: "text-emerald-600",
    },
    {
      title: "Cost of Goods Sold",
      value: formatCurrency(data.cogs.total),
      icon: Package,
      description: "Materials + direct costs",
      color: "text-red-600",
    },
    {
      title: "Gross Profit",
      value: formatCurrency(data.grossProfit),
      icon: DollarSign,
      description: formatPercent(data.grossMargin) + " margin",
      color: data.grossProfit >= 0 ? "text-emerald-600" : "text-red-600",
    },
    {
      title: "Net Profit",
      value: formatCurrency(data.netProfit),
      icon: data.netProfit >= 0 ? TrendingUp : TrendingDown,
      description: formatPercent(data.netMargin) + " margin",
      color: data.netProfit >= 0 ? "text-emerald-600" : "text-red-600",
    },
  ]

  const cogsBreakdown = [
    { name: "Direct Costs (Sales)", amount: data.cogs.directCosts },
    { name: "Raw Materials", amount: data.cogs.rawMaterials },
    { name: "Packaging", amount: data.cogs.packaging },
  ]

  const opexBreakdown = [
    {
      category: "Production Overhead",
      amount: data.operatingExpenses.production.overhead,
    },
    {
      category: "Labor",
      amount: data.operatingExpenses.production.labor,
    },
    {
      category: "Depreciation",
      amount: data.operatingExpenses.production.depreciation,
    },
    ...Object.entries(data.operatingExpenses.administrative).map(
      ([cat, amt]) => ({ category: cat, amount: amt })
    ),
  ]

  const revenueCogsChart = [
    {
      name: "Revenue",
      value: data.revenue.totalSales,
    },
    {
      name: "COGS",
      value: data.cogs.total,
    },
    {
      name: "Gross Profit",
      value: data.grossProfit,
    },
  ]

  const productChart = data.productProfitability.map((p) => ({
    name: p.name.length > 20 ? p.name.slice(0, 18) + "..." : p.name,
    revenue: p.revenue,
    cogs: p.cogs,
    profit: p.profit,
  }))

  const profitColors = data.grossProfit >= 0 ? "bg-emerald-50" : "bg-red-50"
  const netProfitColors =
    data.netProfit >= 0
      ? "border-emerald-200 bg-emerald-50"
      : "border-red-200 bg-red-50"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profit & Loss Statement</h1>
          <p className="text-muted-foreground">
            Manufacturing financial overview
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border p-1">
          {(["month", "quarter", "year"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                period === p
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {p === "month"
                ? "This Month"
                : p === "quarter"
                  ? "This Quarter"
                  : "This Year"}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.color}`}>
                {card.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue vs COGS Chart */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Revenue vs COGS vs Gross Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueCogsChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Factory className="h-5 w-5" />
              COGS Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cogsBreakdown.map((item) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{item.name}</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width:
                          data.cogs.total > 0
                            ? `${(item.amount / data.cogs.total) * 100}%`
                            : "0%",
                      }}
                    />
                  </div>
                </div>
              ))}
              <div className="border-t pt-3">
                <div className="flex items-center justify-between font-semibold">
                  <span>Total COGS</span>
                  <span>{formatCurrency(data.cogs.total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* P&L Statement Table */}
      <Card className={profitColors}>
        <CardHeader>
          <CardTitle>Income Statement</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-semibold text-lg">
                  Total Sales Revenue
                </TableCell>
                <TableCell className="text-right font-semibold text-lg">
                  {formatCurrency(data.revenue.totalSales)}
                </TableCell>
              </TableRow>
              <TableRow className="bg-muted/30">
                <TableCell className="pl-8">Direct Costs (COGS)</TableCell>
                <TableCell className="text-right">
                  ({formatCurrency(data.cogs.directCosts)})
                </TableCell>
              </TableRow>
              <TableRow className="bg-muted/30">
                <TableCell className="pl-8">Raw Materials</TableCell>
                <TableCell className="text-right">
                  ({formatCurrency(data.cogs.rawMaterials)})
                </TableCell>
              </TableRow>
              <TableRow className="bg-muted/30">
                <TableCell className="pl-8">Packaging</TableCell>
                <TableCell className="text-right">
                  ({formatCurrency(data.cogs.packaging)})
                </TableCell>
              </TableRow>
              <TableRow className="border-t-2 border-primary/20">
                <TableCell className="font-semibold">
                  GROSS PROFIT
                </TableCell>
                <TableCell
                  className={`text-right font-bold ${
                    data.grossProfit >= 0 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(data.grossProfit)}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({formatPercent(data.grossMargin)})
                  </span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  colSpan={2}
                  className="font-semibold text-base pt-4"
                >
                  Operating Expenses
                </TableCell>
              </TableRow>
              {opexBreakdown
                .filter((o) => o.amount > 0)
                .map((item) => (
                  <TableRow key={item.category} className="bg-muted/30">
                    <TableCell className="pl-8">{item.category}</TableCell>
                    <TableCell className="text-right">
                      ({formatCurrency(item.amount)})
                    </TableCell>
                  </TableRow>
                ))}
              <TableRow className="border-t-2 border-primary/20">
                <TableCell className="font-semibold">
                  NET PROFIT (LOSS)
                </TableCell>
                <TableCell
                  className={`text-right font-bold ${
                    data.netProfit >= 0 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(data.netProfit)}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({formatPercent(data.netMargin)})
                  </span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Product Profitability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Product Profitability
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.productProfitability.length > 0 ? (
            <>
              <div className="mb-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={productChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis
                      tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Bar
                      dataKey="revenue"
                      fill="#2563eb"
                      name="Revenue"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="cogs"
                      fill="#ef4444"
                      name="COGS"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="profit"
                      fill="#10b981"
                      name="Profit"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Qty Sold</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">COGS</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.productProfitability.map((p) => (
                    <TableRow key={p.name}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-right">
                        {p.quantity.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(p.revenue)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(p.cogs)}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          p.profit >= 0 ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {formatCurrency(p.profit)}
                      </TableCell>
                      <TableCell
                        className={`text-right ${
                          p.margin >= 0 ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {formatPercent(p.margin)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No product sales data for this period.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
