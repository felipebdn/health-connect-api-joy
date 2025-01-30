import { z } from 'zod'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { PrismaProviderRepository } from '@/infra/db/repositories/prisma-provider-repository'
import { NewPasswordUseCase } from '@/domain/atlas-api/application/use-cases/new-password-use-case'
import { PrismaAuthCodeRepository } from '@/infra/db/repositories/prisma-auth-code-repository'
import { BcryptHasher } from '@/infra/criptography/bcrypt-hasher'
import { UnauthorizedError } from '../_errors/unauthorized-error'
import { ConflictActionError } from '@/domain/atlas-api/application/use-cases/errors/conflit-errror-action'
import { getPrismaClient } from '@/infra/db/prisma'
import { PrismaInstitutionRepository } from '@/infra/db/repositories/prisma-instituition-repository'
import { PrismaPatientRepository } from '@/infra/db/repositories/prisma-patient-repository'

function makeNewPasswordUseCase() {
  const prisma = getPrismaClient()
  const providerRepository = new PrismaProviderRepository(prisma)
  const prismaInstitutionRepository = new PrismaInstitutionRepository(prisma)
  const prismaPatientRepository = new PrismaPatientRepository(prisma)
  const authCodeRepository = new PrismaAuthCodeRepository(prisma)
  const bcryptHasher = new BcryptHasher()
  return new NewPasswordUseCase(
    providerRepository,
    prismaInstitutionRepository,
    prismaPatientRepository,
    authCodeRepository,
    bcryptHasher,
    bcryptHasher
  )
}

export async function NewPasswordRouter(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    '/new-password',
    {
      schema: {
        tags: ['Provider'],
        summary: 'Create a new password.',
        body: z.object({
          password: z.string().min(1, { message: 'Name is not empty.' }),
        }),
        querystring: z.object({
          code: z.string(),
        }),
        response: {
          200: z.never(),
          400: z.string(),
          401: z.string(),
          404: z.string(),
          409: z.string(),
        },
      },
    },
    async ({ body, query }, reply) => {
      const newPasswordUseCase = makeNewPasswordUseCase()

      const result = await newPasswordUseCase.execute({ ...body, ...query })

      if (result.isLeft()) {
        const error = result.value

        switch (error.constructor) {
          case UnauthorizedError:
            return reply.status(401).send(error.message)
          case ConflictActionError:
            return reply.status(409).send(error.message)
          case ResourceNotFoundError:
            return reply.status(404).send(error.message)
          default:
            return reply.status(400).send(error.message)
        }
      }

      return reply.status(200).send()
    }
  )
}
