import { z } from 'zod'

import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { ProviderPresenter } from '@/infra/db/presenters/provider-presenter'
import { GetProviderUseCase } from '@/domain/atlas-api/application/use-cases/get-provider-use-case'
import { DrizzleProviderRepository } from '@/infra/db/repositories/drizzle-provider-repository'

function makeGetProviderUseCase() {
  const providerRepository = new DrizzleProviderRepository()
  return new GetProviderUseCase(providerRepository)
}

export async function GetProviderRouter(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/provider/:providerId',
    {
      schema: {
        tags: ['Provider'],
        summary: 'Find a provider.',
        params: z.object({
          providerId: z.string(),
        }),
        response: {
          200: z.object({
            provider: z.object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
              cpf: z.string(),
              phone: z.string(),
              duration: z.number().nullable(),
              birthday: z.date(),
              price: z.number(),
              specialty: z.string(),
              education: z.string().optional(),
              description: z.string().optional(),
            }),
          }),
          400: z.string(),
          404: z.string(),
        },
      },
    },
    async ({ params: { providerId } }, reply) => {
      const getProviderUseCase = makeGetProviderUseCase()

      const result = await getProviderUseCase.execute({ providerId })

      if (result.isLeft()) {
        const error = result.value

        switch (error.constructor) {
          case ResourceNotFoundError:
            throw reply.status(404).send(error.message)
          default:
            throw reply.status(400).send(error.message)
        }
      }

      return reply
        .status(200)
        .send({ provider: ProviderPresenter.toHTTP(result.value.provider) })
    }
  )
}
