import { z } from 'zod'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { PrismaProviderRepository } from '@/infra/db/repositories/prisma-provider-repository'
import { NewPasswordUseCase } from '@/domain/atlas-api/application/use-cases/new-password-use-case'
import { PrismaAuthCodeRepository } from '@/infra/db/repositories/prisma-auth-code-repository'
import { UnauthorizedError } from '../_errors/unauthorized-error'
import { ConflictActionError } from '@/domain/atlas-api/application/use-cases/errors/conflit-errror-action'
import { getPrismaClient } from '@/infra/db/prisma'
import { PrismaPatientRepository } from '@/infra/db/repositories/prisma-patient-repository'
import { PrismaInstitutionRepository } from '@/infra/db/repositories/prisma-institution-repository'
import { BcryptHasher } from '@/infra/criptography/bcrypt-hasher'

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
          401: z.object({ message: z.string(), status: z.literal(401) }),
          404: z.object({ message: z.string(), status: z.literal(404) }),
          409: z.object({ message: z.string(), status: z.literal(409) }),
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
            return reply
              .status(401)
              .send({ message: error.message, status: 401 })
          case ConflictActionError:
            return reply
              .status(409)
              .send({ message: error.message, status: 409 })
          case ResourceNotFoundError:
            return reply
              .status(404)
              .send({ message: error.message, status: 404 })
          default:
            return reply.send()
        }
      }

      return reply.status(200).send()
    }
  )
}
