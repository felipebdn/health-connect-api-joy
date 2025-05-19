import { z } from 'zod'

import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { ProviderPresenter } from '@/infra/db/presenters/provider-presenter'
import { GetProviderUseCase } from '@/domain/atlas-api/application/use-cases/get-provider-use-case'
import { PrismaProviderRepository } from '@/infra/db/repositories/prisma-provider-repository'
import { getPrismaClient } from '@/infra/db/prisma'
import { PrismaAddressRepository } from '@/infra/db/repositories/prisma-address-repository'
import { PrismaRatingRepository } from '@/infra/db/repositories/prisma-rating-repository'
import { AddressPresenter } from '@/infra/db/presenters/address-presenter'
import { RatingPresenter } from '@/infra/db/presenters/rating-presenter'

function makeGetProviderUseCase() {
  const prisma = getPrismaClient()
  const providerRepository = new PrismaProviderRepository(prisma)
  const addressRepository = new PrismaAddressRepository(prisma)
  const ratingRepository = new PrismaRatingRepository(prisma)
  return new GetProviderUseCase(
    providerRepository,
    addressRepository,
    ratingRepository
  )
}

export async function GetProviderRouter(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/provider/:providerId',
    {
      preHandler: [app.authenticate],
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
              providerCode: z.string(),
              phone: z.string(),
              duration: z.number().nullable(),
              birthday: z.date(),
              occupation: z.string(),
              price: z.number(),
              specialty: z.string(),
              education: z.string().optional(),
              description: z.string().optional(),
            }),
            ratings: z.array(
              z.object({
                id: z.string(),
                providerId: z.string(),
                appointmentId: z.string(),
                patientId: z.string(),
                rating: z.coerce.number(),
                name: z.string(),
                description: z.string().optional(),
                createdAt: z.coerce.date(),
              })
            ),
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
          }),
          404: z.object({ message: z.string(), status: z.literal(404) }),
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
            throw reply
              .status(404)
              .send({ message: error.message, status: 404 })
          default:
            throw reply.send()
        }
      }

      const { provider, address, ratings } = result.value

      return reply.status(200).send({
        provider: ProviderPresenter.toHTTP(provider),
        ratings: ratings.map(RatingPresenter.toHTTP),
        ...(address && {
          address: AddressPresenter.toHTTP(address),
        }),
      })
    }
  )
}
