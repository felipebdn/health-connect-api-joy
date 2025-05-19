import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { getPrismaClient } from '@/infra/db/prisma'
import { ListAffiliationsUseCase } from '@/domain/atlas-api/application/use-cases/list-affiliations-use-case'
import { PrismaAffiliationRepository } from '@/infra/db/repositories/prisma-affiliation-repository'
import {
  AffiliationPresenter,
  AffiliationPresenterSchema,
} from '@/infra/db/presenters/affiliation-presenter'
import {
  ProviderPresenter,
  ProviderPresenterSchema,
} from '@/infra/db/presenters/provider-presenter'
import {
  InstitutionPresenter,
  InstitutionPresenterSchema,
} from '@/infra/db/presenters/institution-presenter'

function makeListAffiliationUseCase() {
  const prisma = getPrismaClient()
  const affiliationRepository = new PrismaAffiliationRepository(prisma)
  return new ListAffiliationsUseCase(affiliationRepository)
}

export async function ListAffiliationRouter(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/affiliations',
    {
      schema: {
        tags: ['Affiliation'],
        summary: 'List affiliation by provider or institution.',
        querystring: z.object({
          providerId: z.string().optional(),
          institutionId: z.string().optional(),
        }),
        response: {
          200: z.array(
            z.object({
              affiliation: AffiliationPresenterSchema,
              provider: ProviderPresenterSchema,
              institution: InstitutionPresenterSchema,
            })
          ),
        },
      },
    },
    async ({ query }, reply) => {
      const affiliations = makeListAffiliationUseCase()

      const result = await affiliations.execute({
        institutionId: query.institutionId,
        providerId: query.providerId,
      })

      return reply.status(200).send(
        result.affiliations.map(({ affiliation, institution, provider }) => ({
          affiliation: AffiliationPresenter.toHTTP(affiliation),
          institution: InstitutionPresenter.toHTTP(institution),
          provider: ProviderPresenter.toHTTP(provider),
        }))
      )
    }
  )
}
