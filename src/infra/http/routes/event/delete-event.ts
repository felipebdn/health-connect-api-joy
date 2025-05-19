import { z } from 'zod'

import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { auth } from '../../middlewares/auth'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { DeleteEventUseCase } from '@/domain/atlas-api/application/use-cases/delete-event-use-case'
import { PrismaAppointmentRepository } from '@/infra/db/repositories/prisma-appointment-repository'
import { PrismaEventRepository } from '@/infra/db/repositories/prisma-events-repository'
import { getPrismaClient } from '@/infra/db/prisma'

function makeDeleteEventUseCase() {
  const prisma = getPrismaClient()
  const AppointmentRepository = new PrismaAppointmentRepository(prisma)
  const EventRepository = new PrismaEventRepository(prisma)
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
        preHandler: [app.authenticate],
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
            404: z.object({ status: z.literal(404), message: z.string() }),
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
