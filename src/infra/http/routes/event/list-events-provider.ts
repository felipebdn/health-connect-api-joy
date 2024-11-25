import { z } from 'zod'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { DrizzleEventRepository } from '@/infra/db/repositories/drizzle-events-repository'
import { DrizzleProviderRepository } from '@/infra/db/repositories/drizzle-provider-repository'
import { ListEventsProviderUseCase } from '@/domain/atlas-api/application/use-cases/list-events-provider-use-case'
import { EventPresenterWithAppointment } from '@/infra/db/presenters/event-presenter'

function makeListEventsProviderUseCase() {
  const providerRepository = new DrizzleProviderRepository()
  const eventRepository = new DrizzleEventRepository()
  return new ListEventsProviderUseCase(providerRepository, eventRepository)
}

export async function ListEventsProviderRouter(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/provider/:providerId/events',
    {
      schema: {
        tags: ['Event'],
        summary: 'List availability by month.',
        params: z.object({
          providerId: z.string(),
        }),
        response: {
          200: z.object({
            events: z.array(
              z.object({
                Id: z.string(),
                providerId: z.string(),
                Title: z.string(),
                Start: z.date(),
                End: z.date(),
                StartTimezone: z.string(),
                EndTimezone: z.string(),
                RecurrenceRule: z.string().optional(),
                RecurrenceID: z.string().optional(),
                RecurrenceException: z.string().optional(),
              })
            ),
          }),
          400: z.string(),
          404: z.string(),
        },
      },
    },
    async ({ params }, reply) => {
      const listEventsProvider = makeListEventsProviderUseCase()

      const result = await listEventsProvider.execute({ ...params })

      if (result.isLeft()) {
        const error = result.value

        switch (error.constructor) {
          case ResourceNotFoundError:
            return reply.status(404).send(error.message)
          default:
            return reply.status(400).send(error.message)
        }
      }
      return reply.status(200).send({
        events: result.value.events.map((item) =>
          EventPresenterWithAppointment.toHTTP(item.event)
        ),
      })
    }
  )
}
