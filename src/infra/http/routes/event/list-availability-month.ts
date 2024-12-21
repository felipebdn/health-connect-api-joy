import { z } from 'zod'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { PrismaEventRepository } from '@/infra/db/repositories/prisma-events-repository'
import { PrismaProviderRepository } from '@/infra/db/repositories/prisma-provider-repository'
import { getPrismaClient } from '@/infra/db/prisma'
import { ListAvailabilityByMonthUseCase } from '@/domain/atlas-api/application/use-cases/list-availability-month-use-case'

function makeListAvailabilityByMonthUseCase() {
  const prisma = getPrismaClient()
  const providerRepository = new PrismaProviderRepository(prisma)
  const eventRepository = new PrismaEventRepository(prisma)
  return new ListAvailabilityByMonthUseCase(eventRepository, providerRepository)
}

export async function ListAvailabilityByMonthRouter(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/:providerId/availabilities/month/:date',
    {
      schema: {
        tags: ['Event'],
        summary: 'List availability by month.',
        params: z.object({
          providerId: z.string(),
          date: z.coerce.date(),
        }),
        response: {
          200: z.object({
            dates: z.array(z.date()),
          }),
          400: z.string(),
          404: z.string(),
        },
      },
    },
    async ({ params }, reply) => {
      const listAvailabilityByMonth = makeListAvailabilityByMonthUseCase()

      const result = await listAvailabilityByMonth.execute({ ...params })
      console.log(result.value)

      if (result.isLeft()) {
        const error = result.value

        switch (error.constructor) {
          case ResourceNotFoundError:
            return reply.status(404).send(error.message)
          default:
            return reply.status(400).send(error.message)
        }
      }
      return reply.status(200).send({ dates: result.value.dates })
    }
  )
}
