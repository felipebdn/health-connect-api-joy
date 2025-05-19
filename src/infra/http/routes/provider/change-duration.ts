import { z } from 'zod'

import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { auth } from '../../middlewares/auth'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { ChangeDurationUseCase } from '@/domain/atlas-api/application/use-cases/change-duration-use-case'
import { PrismaProviderRepository } from '@/infra/db/repositories/prisma-provider-repository'
import { getPrismaClient } from '@/infra/db/prisma'

function makeChangeDurationUseCase() {
  const prisma = getPrismaClient()
  const providerRepository = new PrismaProviderRepository(prisma)
  const changeDurationUseCase = new ChangeDurationUseCase(providerRepository)

  return changeDurationUseCase
}

export async function ChangeDurationRouter(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/provider/:providerId/duration',
      {
        preHandler: [app.authenticate],
        schema: {
          tags: ['Provider'],
          summary: 'Change the query duration.',
          security: [{ bearerAuth: [] }],
          body: z.object({
            duration: z.coerce.number().min(1, {
              message: 'Duration none empty.',
            }),
          }),
          params: z.object({
            providerId: z.string(),
          }),
          response: {
            200: z.never(),
            401: z.object({ message: z.string(), status: z.literal(401) }),
            404: z.object({ message: z.string(), status: z.literal(404) }),
          },
        },
      },
      async ({ body, params, getCurrentUserId }, reply) => {
        const userId = await getCurrentUserId()

        if (params.providerId !== userId) {
          return reply
            .status(401)
            .send({ message: 'Unauthorized.', status: 401 })
        }

        const changeDurationUseCase = makeChangeDurationUseCase()

        const result = await changeDurationUseCase.execute({
          duration: body.duration,
          providerId: params.providerId,
        })

        if (result.isLeft()) {
          const error = result.value

          switch (error.constructor) {
            case ResourceNotFoundError: {
              return reply
                .status(404)
                .send({ message: error.message, status: 404 })
            }
            default:
              return reply.send()
          }
        }
        return reply.status(200).send()
      }
    )
}
