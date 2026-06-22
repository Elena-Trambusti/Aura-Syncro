import { Prisma } from '@prisma/client'
import { HttpError } from './httpErrors'

export function mapPrismaError(err: unknown): HttpError | null {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return new HttpError(409, 'Record già esistente', 'DUPLICATE')
    }
    if (err.code === 'P2025') {
      return new HttpError(404, 'Record non trovato', 'NOT_FOUND')
    }
  }
  if (err instanceof Prisma.PrismaClientInitializationError) {
    return new HttpError(503, 'Database temporaneamente non disponibile', 'DB_UNAVAILABLE')
  }
  return null
}
