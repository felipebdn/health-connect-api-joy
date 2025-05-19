import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { getPrismaClient } from '@/infra/db/prisma'
import { PrismaAffiliationRepository } from '@/infra/db/repositories/prisma-affiliation-repository'
import { PrismaProviderRepository } from '@/infra/db/repositories/prisma-provider-repository'
import { PrismaInstitutionRepository } from '@/infra/db/repositories/prisma-institution-repository'
import { RemoveAffiliationUseCase } from '@/domain/atlas-api/application/use-cases/remove-affiliation-use-case'

function makeDeleteAffiliationUseCase() {
  const prisma = getPrismaClient()
  const affiliationRepository = new PrismaAffiliationRepository(prisma)
  const providerRepository = new PrismaProviderRepository(prisma)
  const institutionRepository = new PrismaInstitutionRepository(prisma)
  return new RemoveAffiliationUseCase(
    affiliationRepository,
    providerRepository,
    institutionRepository
  )
}

export async function DeleteAffiliationRouter(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/affiliation/:providerId/:institutionId',
    {
      schema: {
        tags: ['Affiliation'],
        summary: 'Delete affiliation.',
        params: z.object({
          providerId: z.string(),
          institutionId: z.string(),
        }),
        response: {
          200: z.never(),
          404: z.object({ status: z.literal(404), message: z.string() }),
        },
      },
    },
    async ({ params }, reply) => {
      const deleteAffiliation = makeDeleteAffiliationUseCase()

      const result = await deleteAffiliation.execute({
        institutionId: params.institutionId,
        providerId: params.providerId,
      })

      if (result.isLeft()) {
        const error = result.value

        switch (error.constructor) {
          case ResourceNotFoundError:
            return reply
              .status(404)
              .send({ message: error.message, status: 404 })

          default:
            return reply.send()
        }
      }

      return reply.status(200).send()
    }
  )
}
