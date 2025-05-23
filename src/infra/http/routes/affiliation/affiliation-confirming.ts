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
import { AffiliationConfirmingUseCase } from '@/domain/atlas-api/application/use-cases/affiliation-confirming-use-case'
import { PrismaAffiliationCodeRepository } from '@/infra/db/repositories/prisma-affiliation-code-repository'
import {
  ProviderPresenter,
  ProviderPresenterSchema,
} from '@/infra/db/presenters/provider-presenter'
import {
  InstitutionPresenter,
  InstitutionPresenterSchema,
} from '@/infra/db/presenters/institution-presenter'

function makeAffiliationConfirmingUseCase() {
  const prisma = getPrismaClient()
  const providerRepository = new PrismaProviderRepository(prisma)
  const institutionRepository = new PrismaInstitutionRepository(prisma)
  const affiliationRepository = new PrismaAffiliationRepository(prisma)
  const affiliationCodeRepository = new PrismaAffiliationCodeRepository(prisma)
  return new AffiliationConfirmingUseCase(
    affiliationCodeRepository,
    providerRepository,
    institutionRepository,
    affiliationRepository
  )
}

export async function AffiliationConfirmingRouter(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/affiliation/:code',
    {
      schema: {
        tags: ['Institution'],
        summary: 'Affiliation confirming.',
        params: z.object({
          code: z.string(),
        }),
        response: {
          200: z.object({
            provider: ProviderPresenterSchema,
            institution: InstitutionPresenterSchema,
          }),
          400: z.object({ status: z.literal(400), message: z.string() }),
          404: z.object({ status: z.literal(404), message: z.string() }),
          409: response409,
        },
      },
    },
    async ({ params }, reply) => {
      const affiliationConfirming = makeAffiliationConfirmingUseCase()

      const result = await affiliationConfirming.execute(params)

      if (result.isLeft()) {
        const error = result.value

        if (error instanceof BadRequestError) {
          return reply
            .status(400)
            .send({ message: 'Código expirado ou inválido', status: 400 })
        }

        if (error instanceof ResourceNotFoundError) {
          return reply.status(404).send({ message: error.message, status: 404 })
        }

        if (error instanceof ResourceAlreadyExistsError) {
          return reply.status(409).send(error.toJSON())
        }

        return reply.status(400).send()
      }

      return reply.status(200).send({
        institution: InstitutionPresenter.toHTTP(result.value.institution),
        provider: ProviderPresenter.toHTTP(result.value.provider),
      })
    }
  )
}
