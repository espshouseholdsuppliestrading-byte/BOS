import { prisma } from "./db"

export async function logAudit(params: {
  userId: string
  companyId: string
  entity: string
  entityId?: string
  action: string
  oldData?: any
  newData?: any
  ipAddress?: string
}) {
  return prisma.auditLog.create({
    data: {
      userId: params.userId,
      companyId: params.companyId,
      entity: params.entity,
      entityId: params.entityId,
      action: params.action,
      oldData: params.oldData ? JSON.stringify(params.oldData) : undefined,
      newData: params.newData ? JSON.stringify(params.newData) : undefined,
      ipAddress: params.ipAddress,
    },
  })
}
