import { z } from 'zod'

import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { PrismaProviderRepository } from '@/infra/db/repositories/prisma-provider-repository'
import { getPrismaClient } from '@/infra/db/prisma'
import { GetUserUseCase } from '@/domain/atlas-api/application/use-cases/get-user.use.case'
import { PrismaPatientRepository } from '@/infra/db/repositories/prisma-patient-repository'
import { PrismaInstitutionRepository } from '@/infra/db/repositories/prisma-institution-repository'

function makeGetUserUseCase() {
  const prisma = getPrismaClient()
  const providerRepository = new PrismaProviderRepository(prisma)
  const patientRepository = new PrismaPatientRepository(prisma)
  const institutionRepository = new PrismaInstitutionRepository(prisma)
  return new GetUserUseCase(
    providerRepository,
    patientRepository,
    institutionRepository
  )
}

export async function GetUserRouter(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/auth/get-user',
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ['Auth'],
        summary: 'Get authenticated user.',
        response: {
          200: z.object({
            user: z.object({
              id: z.string(),
              name: z.string(),
              role: z.enum(['PATIENT', 'PROVIDER', 'INSTITUTION']),
              duration: z.coerce.number().optional(),
            }),
          }),
          404: z.object({ status: z.literal(404), message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { role, sub } = request.user

      const getUserUseCase = makeGetUserUseCase()
      const result = await getUserUseCase.execute({ role, userId: sub })

      if (result.isLeft()) {
        const error = result.value

        switch (error.constructor) {
          case ResourceNotFoundError:
            throw reply
              .status(404)
              .send({ message: error.message, status: 404 })
          default:
            throw reply.send()
        }
      }

      return reply.status(200).send(result.value)
    }
  )
}
