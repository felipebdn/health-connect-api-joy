import { getPrismaClient } from '@/infra/db/prisma'
import type { PrismaClient } from '@prisma/client'
import 'dotenv/config'
import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'

let prisma: PrismaClient

function generateUniqueDatabaseURL(schemaId: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error('Please provide a DATABASE_URL environment variable')
  }
  const url = new URL(process.env.DATABASE_URL)
  url.searchParams.set('schema', schemaId)
  return url.toString()
}

const schemaId = randomUUID()

beforeAll(async () => {
  const databaseUrl = generateUniqueDatabaseURL(schemaId)

  // Configurando a URL do banco de dados
  process.env.DATABASE_URL = databaseUrl

  // Inicializando o cliente Prisma
  prisma = getPrismaClient(databaseUrl)

  // Aplicando as migrações com a URL correta
  try {
    execSync('npx prisma db push', {
      env: { ...process.env, DATABASE_URL: databaseUrl },
    })
  } catch (error) {
    console.error('Error applying migrations:', error)
    throw error
  }
})

afterAll(async () => {
  // Limpando o esquema após os testes
  try {
    await prisma.$executeRawUnsafe(
      `DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`
    )
  } catch (error) {
    console.error('Error dropping schema:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
})
