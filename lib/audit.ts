import { prisma } from "./db"

export async function logAudit(params: {
  userId: string
  companyId: string
  entity: string
  entityId?: string
  action: string
  details?: any
  ipAddress?: string
}) {
  return prisma.auditLog.create({
    data: {
      userId: params.userId,
      companyId: params.companyId,
      entity: params.entity,
      entityId: params.entityId,
      action: params.action,
      details: params.details ? JSON.parse(JSON.stringify(params.details)) : undefined,
      ipAddress: params.ipAddress,
    },
  })
}
