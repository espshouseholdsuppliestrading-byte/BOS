"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, TrendingUp, TrendingDown, Receipt, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface ProfitLossData {
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
}

const formatCurrency = (value: number) => `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function FinancePage() {
  const [data, setData] = useState<ProfitLossData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("year")

  const fetchData = async () => {
    setLoading(true)
    const res = await fetch(`/api/reports/profit-loss?type=supply&period=${period}`)
    if (res.ok) {
      setData(await res.json())
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [period])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profit & Loss Statement</h1>
          <p className="text-muted-foreground">Loading financial data...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 animate-pulse bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!data) return null

  const expenseCategories = Object.entries(data.expenses).sort((a, b) => b[1] - a[1])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profit & Loss Statement</h1>
          <p className="text-muted-foreground">ESPS Supply Corporation — Financial overview</p>
        </div>
        <div className="flex gap-2">
          {["month", "quarter", "year"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                period === p
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {p === "month" ? "This Month" : p === "quarter" ? "This Quarter" : "This Year"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(data.revenue)}</div>
            <p className="text-xs text-muted-foreground">{data.orderCount} sales orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost of Goods Sold</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(data.cogs)}</div>
            <p className="text-xs text-muted-foreground">{data.grossMargin.toFixed(1)}% gross margin</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
            {data.grossProfit >= 0 ? (
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.grossProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(data.grossProfit)}
            </div>
            <p className="text-xs text-muted-foreground">{data.grossMargin.toFixed(1)}% margin</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            {data.netProfit >= 0 ? (
              <DollarSign className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(data.netProfit)}
            </div>
            <p className="text-xs text-muted-foreground">{data.netMargin.toFixed(1)}% net margin</p>
          </CardContent>
        </Card>
      </div>

      {data.monthlyData.length > 0 && data.monthlyData.some((m) => m.revenue > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="revenue" fill="#22c55e" name="Revenue" />
                <Bar dataKey="cogs" fill="#f97316" name="COGS" />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                <Bar dataKey="profit" fill="#3b82f6" name="Net Profit" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Income Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Revenue (Sales)</span>
                <span className="font-medium text-green-600">{formatCurrency(data.revenue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Cost of Goods Sold</span>
                <span className="font-medium text-orange-600">({formatCurrency(data.cogs)})</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex items-center justify-between font-semibold">
                  <span>Gross Profit</span>
                  <span className={data.grossProfit >= 0 ? "text-green-600" : "text-red-600"}>
                    {formatCurrency(data.grossProfit)}
                  </span>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  Gross Margin: {data.grossMargin.toFixed(1)}%
                </div>
              </div>
              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-muted-foreground">Operating Expenses</span>
                <span className="font-medium text-red-600">({formatCurrency(data.totalExpenses)})</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Net Profit</span>
                  <span className={data.netProfit >= 0 ? "text-green-600" : "text-red-600"}>
                    {formatCurrency(data.netProfit)}
                  </span>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  Net Margin: {data.netMargin.toFixed(1)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operating Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {expenseCategories.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">No expenses recorded for this period.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">% of Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenseCategories.map(([category, amount]) => (
                    <TableRow key={category}>
                      <TableCell className="font-medium">{category}</TableCell>
                      <TableCell className="text-right">{formatCurrency(amount)}</TableCell>
                      <TableCell className="text-right">
                        {data.totalExpenses > 0
                          ? ((amount / data.totalExpenses) * 100).toFixed(1)
                          : "0.0"}
                        %
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-semibold">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">{formatCurrency(data.totalExpenses)}</TableCell>
                    <TableCell className="text-right">100.0%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
