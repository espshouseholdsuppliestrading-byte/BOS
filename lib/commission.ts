import { prisma } from "./db"

export async function calculateCommissions(orderId: string, companyId: string): Promise<void> {
  const order = await prisma.salesOrder.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: true } },
      salesAgent: true,
      distributor: true,
      territory: true,
    },
  })

  if (!order) return

  const commissionsToCreate: Array<{
    orderId: string
    userId: string
    type: string
    amount: number
    ruleId?: string
    territoryId?: string
    companyId: string
    productId: string
  }> = []

  for (const item of order.items) {
    const rules = await prisma.commissionRule.findMany({
      where: {
        companyId,
        status: "active",
        OR: [
          { productId: item.productId },
          { productId: null },
        ],
      },
    })

    const primaryUser = order.distributorId || order.salesAgentId
    if (!primaryUser) continue

    for (const rule of rules) {
      const primaryRole = order.distributorId ? "DISTRIBUTOR" : "SALES_AGENT"
      if (rule.userRole !== primaryRole) continue

      let amount = 0
      if (rule.type === "fixed") {
        amount = Number(rule.amount)
      } else {
        amount = (Number(item.sellingPrice) * Number(rule.amount)) / 100
      }

      commissionsToCreate.push({
        orderId: order.id,
        userId: primaryUser,
        type: rule.type,
        amount,
        ruleId: rule.id,
        territoryId: order.territoryId || undefined,
        companyId,
        productId: item.productId,
      })

      if (rule.overrideUp && rule.overridePercent) {
        if (order.territoryId) {
          const territory = await prisma.territory.findUnique({
            where: { id: order.territoryId },
          })
          if (territory?.parentId) {
            const parentUsers = await prisma.user.findMany({
              where: {
                companyId,
                territoryId: territory.parentId,
                role: { in: ["TERRITORY_PARTNER", "DISTRIBUTOR"] },
              },
            })
            for (const parentUser of parentUsers) {
              const overrideAmount = (Number(item.sellingPrice) * Number(rule.overridePercent)) / 100
              commissionsToCreate.push({
                orderId: order.id,
                userId: parentUser.id,
                type: "override",
                amount: overrideAmount,
                ruleId: rule.id,
                territoryId: territory.parentId,
                companyId,
                productId: item.productId,
              })
            }
          }
        }
      }
    }
  }

  if (commissionsToCreate.length > 0) {
    await prisma.commission.createMany({
      data: commissionsToCreate.map((c) => ({
        orderId: c.orderId,
        userId: c.userId,
        type: c.type,
        amount: c.amount,
        ruleId: c.ruleId || null,
        territoryId: c.territoryId || null,
        companyId: c.companyId,
        productId: c.productId,
        status: "pending",
        calculatedAt: new Date(),
      })),
    })

    await prisma.salesOrder.update({
      where: { id: orderId },
      data: { commissionCalculated: true },
    })
  }
}