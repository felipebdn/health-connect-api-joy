import { getPrismaClient } from '@/infra/db/prisma'
import { PrismaInstitutionRepository } from '@/infra/db/repositories/prisma-institution-repository'
import { PrismaPatientRepository } from '@/infra/db/repositories/prisma-patient-repository'
import { PrismaProviderRepository } from '@/infra/db/repositories/prisma-provider-repository'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { RegisterAddressUseCase } from '@/domain/atlas-api/application/use-cases/register-address-use-case'
import { PrismaAddressRepository } from '@/infra/db/repositories/prisma-address-repository'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

function makeRegisterAddressUseCase() {
  const prisma = getPrismaClient()
  const providerRepository = new PrismaProviderRepository(prisma)
  const institutionRepository = new PrismaInstitutionRepository(prisma)
  const patientRepository = new PrismaPatientRepository(prisma)
  const addressRepository = new PrismaAddressRepository(prisma)
  const registerAddressUseCase = new RegisterAddressUseCase(
    providerRepository,
    institutionRepository,
    patientRepository,
    addressRepository
  )

  return registerAddressUseCase
}

export async function RegisterAddressRouter(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/address',
    {
      schema: {
        tags: ['Address'],
        summary: 'Register address for user.',
        body: z.object({
          userId: z.string(),
          street: z.string(),
          number: z.string().optional(),
          district: z.string(),
          complement: z.string().optional(),
          zipCode: z.string(),
          city: z.string(),
          state: z.string(),
          type: z.enum(['PATIENT', 'INSTITUTION', 'PROVIDER']),
        }),
        response: {
          200: z.object({}),
          404: z.object({ status: z.literal(404), message: z.string() }),
        },
      },
    },
    async ({ body }, reply) => {
      const registerAddressUseCase = makeRegisterAddressUseCase()

      const { type, ...data } = body

      const result = await registerAddressUseCase.execute(type, data)

      if (result.isLeft()) {
        const error = result.value

        switch (error.constructor) {
          case ResourceNotFoundError: {
            return reply
              .status(404)
              .send({ status: 404, message: error.message })
          }
          default:
            return reply.send()
        }
      }

      return reply.code(200).send({})
    }
  )
}
