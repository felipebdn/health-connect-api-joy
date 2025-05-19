import { z } from 'zod'

import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { getPrismaClient } from '@/infra/db/prisma'
import { ListProvidersUseCase } from '@/domain/atlas-api/application/use-cases/list-providers-use-case'
import { ProviderPresenter } from '@/infra/db/presenters/provider-presenter'
import { PrismaProviderEventRepository } from '@/infra/db/repositories/prisma-provider-event-repository'
import { RatingPresenter } from '@/infra/db/presenters/rating-presenter'
import { AddressPresenter } from '@/infra/db/presenters/address-presenter'

function makeListProvidersUseCase() {
  const prisma = getPrismaClient()
  const providerEventRepository = new PrismaProviderEventRepository(prisma)
  return new ListProvidersUseCase(providerEventRepository)
}

export async function listProviders(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/providers',
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ['Provider'],
        summary: 'List providers.',
        querystring: z.object({
          name: z.string().optional(),
          specialty: z.string().optional(),
          amount: z.coerce.number(),
          page: z.coerce.number(),
        }),
        response: {
          200: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
              cpf: z.string(),
              phone: z.string(),
              providerCode: z.string(),
              duration: z.number(),
              nextAvailability: z.coerce.date().optional(),
              birthday: z.date(),
              ratings: z.array(
                z.object({
                  providerId: z.string(),
                  rating: z.number(),
                  createdAt: z.coerce.date(),
                  description: z.string().optional(),
                })
              ),
              price: z.number(),
              occupation: z.string(),
              specialty: z.string(),
              education: z.string().optional(),
              description: z.string().optional(),
              address: z
                .object({
                  id: z.string(),
                  street: z.string(),
                  number: z.string().optional(),
                  district: z.string(),
                  complement: z.string().optional(),
                  zipCode: z.string(),
                  city: z.string(),
                  state: z.string(),
                  createdAt: z.coerce.date(),
                })
                .optional(),
            })
          ),
        },
      },
    },
    async ({ query }, reply) => {
      const listProvidersUseCase = makeListProvidersUseCase()

      const result = await listProvidersUseCase.execute(query)

      return reply.status(200).send(
        result.providers.map((item) => ({
          ...ProviderPresenter.toHTTP(item.provider),
          ratings: item.ratings.map(RatingPresenter.toHTTP),
          address: item.address
            ? AddressPresenter.toHTTP(item.address)
            : undefined,
        }))
      )
    }
  )
}
