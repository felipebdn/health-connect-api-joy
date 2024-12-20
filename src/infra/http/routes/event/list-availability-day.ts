import { z } from 'zod'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { PrismaEventRepository } from '@/infra/db/repositories/prisma-events-repository'
import { ListAvailabilityDayUseCase } from '@/domain/atlas-api/application/use-cases/list-availability-day-use-case'
import { PrismaProviderRepository } from '@/infra/db/repositories/prisma-provider-repository'
import { getPrismaClient } from '@/infra/db/prisma'

function makeListAvailabilityDayUseCase() {
  const prisma = getPrismaClient()
  const providerRepository = new PrismaProviderRepository(prisma)
  const eventRepository = new PrismaEventRepository(prisma)
  return new ListAvailabilityDayUseCase(eventRepository, providerRepository)
}

export async function ListAvailabilityDayRouter(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/:providerId/availabilities/day/:date',
    {
      schema: {
        tags: ['Event'],
        summary: 'List availability by day.',
        params: z.object({
          providerId: z.string(),
          date: z.coerce.date(),
        }),
        response: {
          200: z.object({
            schedules: z.array(
              z.object({
                eventId: z.string(),
                startTime: z.date(),
                endTime: z.date(),
              })
            ),
          }),
          400: z.string(),
          404: z.string(),
        },
      },
    },
    async ({ params }, reply) => {
      const listAvailabilityDay = makeListAvailabilityDayUseCase()

      const result = await listAvailabilityDay.execute({ ...params })

      if (result.isLeft()) {
        const error = result.value

        switch (error.constructor) {
          case ResourceNotFoundError:
            return reply.status(404).send(error.message)
          default:
            return reply.status(400).send(error.message)
        }
      }
      return reply.status(200).send({ schedules: result.value.schedules })
    }
  )
}
