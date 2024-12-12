import { z } from 'zod'

import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { auth } from '../../middlewares/auth'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { DrizzleEventRepository } from '@/infra/db/repositories/drizzle-events-repository'
import { NewEventUseCase } from '@/domain/atlas-api/application/use-cases/new-event-use-case'
import { DrizzleProviderRepository } from '@/infra/db/repositories/drizzle-provider-repository'
import { SchedulesConflict } from '@/domain/atlas-api/application/errors/schedules-conflict-error'

function makeNewEventUseCase() {
  const eventRepository = new DrizzleEventRepository()
  const providerRepository = new DrizzleProviderRepository()
  return new NewEventUseCase(eventRepository, providerRepository)
}

export async function NewEventRouter(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/provider/events/new',
      {
        schema: {
          tags: ['Event'],
          summary: 'New event.',
          security: [{ bearerAuth: [] }],
          body: z.object({
            providerId: z.string(),
            title: z.enum(['availability']),
            startTime: z.coerce.date(),
            endTime: z.coerce.date(),
            startTimezone: z.string(),
            endTimezone: z.string(),
            recurrenceRule: z.string().optional(),
            duration: z.coerce.number(),
          }),
          response: {
            201: z.never(),
            400: z.string(),
            404: z.string(),
            409: z.string(),
          },
        },
      },
      async ({ body, getCurrentUserId }, reply) => {
        await getCurrentUserId()

        const newEvent = makeNewEventUseCase()

        const result = await newEvent.execute({ ...body })

        if (result.isLeft()) {
          const error = result.value

          switch (error.constructor) {
            case ResourceNotFoundError:
              return reply.status(404).send(error.message)
            case SchedulesConflict:
              return reply.status(409).send('Available time shorter than the duration of the consultation.')
            default:
              return reply.status(400).send(error.message)
          }
        }
        return reply.status(201).send()
      }
    )
}
