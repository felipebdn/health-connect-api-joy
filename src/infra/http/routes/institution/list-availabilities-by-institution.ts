import { z } from 'zod'

import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { getPrismaClient } from '@/infra/db/prisma'
import { ListAvailabilitiesByInstitutionUseCase } from '@/domain/atlas-api/application/use-cases/list-availabilities-by-institution'
import { PrismaInstitutionProviderEventRepository } from '@/infra/db/repositories/prisma-institution-provider-event'
import {
  ProviderPresenter,
  ProviderPresenterSchema,
} from '@/infra/db/presenters/provider-presenter'

function makeListProvidersUseCase() {
  const prisma = getPrismaClient()
  const providerEventRepository = new PrismaInstitutionProviderEventRepository(
    prisma
  )
  return new ListAvailabilitiesByInstitutionUseCase(providerEventRepository)
}

export async function listAvailabilitiesByInstitution(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/institution/:institutionId/:date',
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ['Institution'],
        summary: 'List availabilities by institution id.',
        params: z.object({
          institutionId: z.string(),
          date: z.coerce.date(),
        }),
        response: {
          200: z.record(z.string(), z.array(ProviderPresenterSchema)),
        },
      },
    },
    async ({ params }, reply) => {
      const listProvidersUseCase = makeListProvidersUseCase()

      const { institutionId, date } = params

      const result = await listProvidersUseCase.execute({ institutionId, date })

      const response: Record<
        string,
        ReturnType<typeof ProviderPresenter.toHTTP>[]
      > = {}

      for (const [key, providers] of Object.entries(result)) {
        response[key] = providers.map(ProviderPresenter.toHTTP)
      }

      return reply.status(200).send(response)
    }
  )
}
