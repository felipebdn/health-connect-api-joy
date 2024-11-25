import { z } from 'zod'

import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { auth } from '../../middlewares/auth'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { ChangeDurationUseCase } from '@/domain/atlas-api/application/use-cases/change-duration-use-case'
import { DrizzleProviderRepository } from '@/infra/db/repositories/drizzle-provider-repository'

function makeChangeDurationUseCase() {
  const providerRepository = new DrizzleProviderRepository()
  const changeDurationUseCase = new ChangeDurationUseCase(providerRepository)

  return changeDurationUseCase
}

export async function ChangeDurationRouter(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch(
      '/provider/:providerId/duration',
      {
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
            400: z.string(),
            404: z.string(),
          },
        },
      },
      async ({ body, params, getCurrentUserId }, reply) => {
        const userId = await getCurrentUserId()

        if (params.providerId !== userId) {
          return reply.status(401).send('Unauthorized.')
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
              return reply.status(404).send(error.message)
            }
            default:
              return reply.status(400).send(error.message)
          }
        }
        return reply.status(200)
      }
    )
}
