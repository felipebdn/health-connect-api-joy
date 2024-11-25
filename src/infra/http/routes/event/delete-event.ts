import { z } from 'zod'

import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { auth } from '../../middlewares/auth'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { DeleteEventUseCase } from '@/domain/atlas-api/application/use-cases/delete-event-use-case'
import { DrizzleAppointmentRepository } from '@/infra/db/repositories/drizzle-appointment-repository'
import { DrizzleEventRepository } from '@/infra/db/repositories/drizzle-events-repository'

function makeDeleteEventUseCase() {
  const AppointmentRepository = new DrizzleAppointmentRepository()
  const EventRepository = new DrizzleEventRepository()
  const deleteEvent = new DeleteEventUseCase(
    AppointmentRepository,
    EventRepository
  )

  return deleteEvent
}

export async function DeleteEventRouter(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      '/provider/events',
      {
        schema: {
          tags: ['Event'],
          summary: 'Delete an event.',
          security: [{ bearerAuth: [] }],
          body: z.object({
            eventId: z.string(),
            type: z.enum(['event', 'recurrence']),
            date: z.coerce.date().optional(),
          }),
          response: {
            200: z.never(),
            404: z.string(),
            400: z.string(),
          },
        },
      },
      async ({ body, getCurrentUserId }, reply) => {
        await getCurrentUserId()

        const deleteEvent = makeDeleteEventUseCase()

        const { eventId, type, date } = body

        const result = await deleteEvent.execute({ eventId, type, date })

        if (result.isLeft()) {
          const error = result.value

          switch (error.constructor) {
            case ResourceNotFoundError:
              return reply.status(404).send(error.message)
            default:
              return reply.status(400).send(error.message)
          }
        }
        return reply.status(200).send()
      }
    )
}
