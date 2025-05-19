import { getPrismaClient } from '@/infra/db/prisma'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { PrismaAddressRepository } from '@/infra/db/repositories/prisma-address-repository'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { UpdateAddressUseCase } from '@/domain/atlas-api/application/use-cases/update-address-use-case'

function makeUpdateAddressUseCase() {
  const prisma = getPrismaClient()
  const addressRepository = new PrismaAddressRepository(prisma)
  const updateAddressUseCase = new UpdateAddressUseCase(addressRepository)

  return updateAddressUseCase
}

export async function UpdateAddressRouter(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    '/address/:addressId',
    {
      schema: {
        tags: ['Address'],
        summary: 'Update address for user.',
        body: z.object({
          userId: z.string(),
          street: z.string(),
          number: z.string().optional(),
          district: z.string(),
          complement: z.string().optional(),
          zipCode: z.string(),
          city: z.string(),
          state: z.string(),
        }),
        params: z.object({
          addressId: z.string(),
        }),
        response: {
          200: z.object({}),
          404: z.object({ status: z.literal(404), message: z.string() }),
        },
      },
    },
    async ({ body, params }, reply) => {
      const updateAddressUseCase = makeUpdateAddressUseCase()

      const result = await updateAddressUseCase.execute({
        ...body,
        addressId: params.addressId,
      })

      if (result.isLeft()) {
        const error = result.value

        switch (error.constructor) {
          case ResourceNotFoundError: {
            return reply
              .status(404)
              .send({ status: 404, message: error.message })
          }
          default:
            return reply.send()
        }
      }

      return reply.code(200).send({})
    }
  )
}
