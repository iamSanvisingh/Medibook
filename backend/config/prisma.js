import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
export const prisma = new PrismaClient({ adapter })

export const connectPrisma = async () => {
  try {
    await prisma.$connect()
    console.log('PostgreSQL (Prisma) Connected')
  } catch (error) {
    console.error('Prisma connection error:', error)
    process.exit(1)
  }
}