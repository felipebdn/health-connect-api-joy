import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

export function getPrismaClient(databaseURL?: string): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: ['warn', 'error'],
      datasources: {
        db: { url: databaseURL || process.env.DATABASE_URL },
      },
    })
  }
  return prisma
}
