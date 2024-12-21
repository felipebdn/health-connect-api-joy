import { z } from 'zod'

import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { PrismaProviderRepository } from '@/infra/db/repositories/prisma-provider-repository'
import { getPrismaClient } from '@/infra/db/prisma'
import { ListProvidersUseCase } from '@/domain/atlas-api/application/use-cases/list-providers-use-case'
import { ProviderPresenter } from '@/infra/db/presenters/provider-presenter'

function makeListProvidersUseCase() {
  const prisma = getPrismaClient()
  const providerRepository = new PrismaProviderRepository(prisma)
  return new ListProvidersUseCase(providerRepository)
}

export async function listProviders(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/providers',
    {
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
              duration: z.number(),
              birthday: z.date(),
              price: z.number(),
              specialty: z.string(),
              education: z.string().optional(),
              description: z.string().optional(),
            })
          ),
          400: z.string(),
        },
      },
    },
    async ({ query }, reply) => {
      const listProvidersUseCase = makeListProvidersUseCase()

      const result = await listProvidersUseCase.execute(query)

      return reply
        .status(200)
        .send(result.providers.map((item) => ProviderPresenter.toHTTP(item)))
    }
  )
}
