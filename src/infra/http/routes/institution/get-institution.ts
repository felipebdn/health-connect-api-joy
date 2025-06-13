import { z } from 'zod'

import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { ProviderPresenter } from '@/infra/db/presenters/provider-presenter'
import { getPrismaClient } from '@/infra/db/prisma'
import { AddressPresenter } from '@/infra/db/presenters/address-presenter'
import { RatingPresenter } from '@/infra/db/presenters/rating-presenter'
import { GetInstitutionUseCase } from '@/domain/atlas-api/application/use-cases/get-institution-use-case'
import { PrismaInstitutionRepository } from '@/infra/db/repositories/prisma-institution-repository'
import {
  InstitutionPresenter,
  InstitutionPresenterSchema,
} from '@/infra/db/presenters/institution-presenter'

function makeGetInstitutionUseCase() {
  const prisma = getPrismaClient()
  const institutionRepository = new PrismaInstitutionRepository(prisma)
  return new GetInstitutionUseCase(institutionRepository)
}

export async function GetInstitutionRouter(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/institution/:institutionId',
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ['Institution'],
        summary: 'Find a institution.',
        params: z.object({
          institutionId: z.string(),
        }),
        response: {
          200: InstitutionPresenterSchema,
          404: z.object({ message: z.string(), status: z.literal(404) }),
        },
      },
    },
    async ({ params: { institutionId } }, reply) => {
      const getInstitutionUseCase = makeGetInstitutionUseCase()

      const result = await getInstitutionUseCase.execute({ institutionId })

      if (result.isLeft()) {
        const error = result.value

        switch (error.constructor) {
          case ResourceNotFoundError:
            throw reply
              .status(404)
              .send({ message: error.message, status: 404 })
          default:
            throw reply.send()
        }
      }

      const { institution } = result.value

      return reply.status(200).send(InstitutionPresenter.toHTTP(institution))
    }
  )
}
