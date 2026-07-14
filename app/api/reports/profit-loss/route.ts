import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || "supply"
  const period = searchParams.get("period") || "year"

  let companyId = session.user.companyId

  if (type === "manufacturing") {
    const mfgCompany = await prisma.company.findFirst({
      where: { name: { contains: "Manufacturing" }, parentId: session.user.companyId },
    })
    if (mfgCompany) companyId = mfgCompany.id
  }

  const now = new Date()
  let startDate: Date

  if (period === "month") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  } else if (period === "quarter") {
    const quarterStart = Math.floor(now.getMonth() / 3) * 3
    startDate = new Date(now.getFullYear(), quarterStart, 1)
  } else {
    startDate = new Date(now.getFullYear(), 0, 1)
  }

  const [salesOrders, expenses, salesOrderItems] = await Promise.all([
    prisma.salesOrder.findMany({
      where: {
        companyId,
        status: { not: "cancelled" },
        createdAt: { gte: startDate },
      },
      include: { items: true },
    }),
    prisma.expense.findMany({
      where: {
        companyId,
        date: { gte: startDate },
      },
    }),
    prisma.salesOrderItem.findMany({
      where: {
        salesOrder: {
          companyId,
          status: { not: "cancelled" },
          createdAt: { gte: startDate },
        },
      },
      include: { salesOrder: true },
    }),
  ])

  const totalRevenue = salesOrders.reduce(
    (sum, order) => sum + Number(order.totalAmount),
    0
  )

  const totalCOGS = salesOrderItems.reduce(
    (sum, item) => sum + Number(item.costPrice) * item.quantity,
    0
  )

  const grossProfit = totalRevenue - totalCOGS
  const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0

  const expensesByCategory: Record<string, number> = {}
  expenses.forEach((expense) => {
    const cat = expense.category || "Other"
    expensesByCategory[cat] = (expensesByCategory[cat] || 0) + Number(expense.amount)
  })

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  )

  const netProfit = grossProfit - totalExpenses
  const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

  const monthlyData: { month: string; revenue: number; cogs: number; expenses: number; profit: number }[] = []

  if (period === "year") {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    for (let m = 0; m < 12; m++) {
      const monthStart = new Date(now.getFullYear(), m, 1)
      const monthEnd = new Date(now.getFullYear(), m + 1, 0, 23, 59, 59)

      const monthOrders = salesOrders.filter((o) => {
        const d = new Date(o.createdAt)
        return d >= monthStart && d <= monthEnd
      })

      const monthItems = salesOrderItems.filter((item) => {
        const d = new Date(item.salesOrder.createdAt)
        return d >= monthStart && d <= monthEnd
      })

      const monthExpenses = expenses.filter((e) => {
        const d = new Date(e.date)
        return d >= monthStart && d <= monthEnd
      })

      const rev = monthOrders.reduce((s, o) => s + Number(o.totalAmount), 0)
      const cogs = monthItems.reduce((s, i) => s + Number(i.costPrice) * i.quantity, 0)
      const exp = monthExpenses.reduce((s, e) => s + Number(e.amount), 0)

      monthlyData.push({
        month: monthNames[m],
        revenue: rev,
        cogs,
        expenses: exp,
        profit: rev - cogs - exp,
      })
    }
  }

  return NextResponse.json({
    period,
    type,
    startDate: startDate.toISOString(),
    endDate: now.toISOString(),
    revenue: totalRevenue,
    cogs: totalCOGS,
    grossProfit,
    grossMargin,
    expenses: expensesByCategory,
    totalExpenses,
    netProfit,
    netMargin,
    monthlyData,
    orderCount: salesOrders.length,
    expenseCount: expenses.length,
  })
}
