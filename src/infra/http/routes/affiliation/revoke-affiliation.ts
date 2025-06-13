import { ResourceAlreadyExistsError } from '@/core/errors/resource-already-exists-error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { getPrismaClient } from '@/infra/db/prisma'
import { PrismaAffiliationRepository } from '@/infra/db/repositories/prisma-affiliation-repository'
import { PrismaInstitutionRepository } from '@/infra/db/repositories/prisma-institution-repository'
import { PrismaProviderRepository } from '@/infra/db/repositories/prisma-provider-repository'
import { response409 } from '@/infra/swagger/responses'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'
import {
  ProviderPresenter,
  ProviderPresenterSchema,
} from '@/infra/db/presenters/provider-presenter'
import {
  InstitutionPresenter,
  InstitutionPresenterSchema,
} from '@/infra/db/presenters/institution-presenter'
import { RevokeAffiliationUseCase } from '@/domain/atlas-api/application/use-cases/revoke-affiliation-use-case'

function makeRevokeAffiliationUseCase() {
  const prisma = getPrismaClient()
  const providerRepository = new PrismaProviderRepository(prisma)
  const institutionRepository = new PrismaInstitutionRepository(prisma)
  const affiliationRepository = new PrismaAffiliationRepository(prisma)
  return new RevokeAffiliationUseCase(
    affiliationRepository,
    providerRepository,
    institutionRepository
  )
}

export async function RevokeAffiliationRouter(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/affiliation/:institutionId/:providerId',
    {
      schema: {
        tags: ['Affiliation'],
        summary: 'Revoke affiliation.',
        params: z.object({
          institutionId: z.string(),
          providerId: z.string(),
        }),
        response: {
          200: z.never(),
          404: z.object({ status: z.literal(404), message: z.string() }),
        },
      },
    },
    async ({ params }, reply) => {
      const revokeAffiliation = makeRevokeAffiliationUseCase()

      const result = await revokeAffiliation.execute(params)

      if (result.isLeft()) {
        const error = result.value

        if (error instanceof ResourceNotFoundError) {
          return reply.status(404).send({ message: error.message, status: 404 })
        }

        return reply.status(400).send()
      }

      return reply.status(200).send()
    }
  )
}
