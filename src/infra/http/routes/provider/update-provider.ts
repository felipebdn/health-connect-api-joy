import { z } from 'zod'

import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { UpdateProviderUseCase } from '@/domain/atlas-api/application/use-cases/update-provider-use-case'
import { auth } from '../../middlewares/auth'
import { PrismaProviderRepository } from '@/infra/db/repositories/prisma-provider-repository'
import { getPrismaClient } from '@/infra/db/prisma'

function makeUpdateProviderUseCase() {
  const prisma = getPrismaClient()
  const providerRepository = new PrismaProviderRepository(prisma)
  return new UpdateProviderUseCase(providerRepository)
}

export async function UpdateProviderRouter(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/provider/:providerId/update',
      {
        preHandler: [app.authenticate],
        schema: {
          tags: ['Provider'],
          summary: 'Update provider.',
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string().min(1, { message: 'Name is not empty.' }),
            phone: z.string(),
            birthday: z.coerce.date(),
            price: z.coerce.number(),
            duration: z.coerce.number(),
            specialty: z.string().min(1, {
              message: 'Specialty is not empty.',
            }),
            occupation: z.string().min(1, {
              message: 'Occupation is not empty.',
            }),
            education: z.string().optional(),
            description: z.string().optional(),
          }),
          params: z.object({
            providerId: z.string(),
          }),
          response: {
            200: z.never(),
            404: z.object({ message: z.string(), status: z.literal(404) }),
          },
        },
      },
      async ({ body, params }, reply) => {
        const updateProviderUseCase = makeUpdateProviderUseCase()

        const result = await updateProviderUseCase.execute({
          ...body,
          ...params,
        })

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

        return reply.status(200).send()
      }
    )
}
