import { z } from 'zod'

import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { auth } from '../../middlewares/auth'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { MethodInvalidError } from '@/domain/atlas-api/application/errors/method-invalid-error'
import { EditEventUseCase } from '@/domain/atlas-api/application/use-cases/edit-event-use-case'
import { PrismaEventRepository } from '@/infra/db/repositories/prisma-events-repository'
import { getPrismaClient } from '@/infra/db/prisma'

function makeEditEventUseCase() {
  const prisma = getPrismaClient()
  const EventRepository = new PrismaEventRepository(prisma)
  const editEvent = new EditEventUseCase(EventRepository)

  return editEvent
}

export async function EditEventRouter(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/provider/events/:eventId',
      {
        preHandler: [app.authenticate],
        schema: {
          tags: ['Event'],
          summary: 'Edit an event.',
          security: [{ bearerAuth: [] }],
          body: z.object({
            providerId: z.string(),
            type: z.enum(['event', 'recurrence']),
            startTime: z.coerce.date(),
            endTime: z.coerce.date(),
            startTimezone: z.string(),
            institutionId: z.string().optional(),
            endTimezone: z.string(),
            recurrenceRule: z.string().optional(),
            currentStartTime: z.coerce.date().optional(),
          }),
          params: z.object({
            eventId: z.string(),
          }),
          response: {
            200: z.never(),
            404: z.object({ status: z.literal(404), message: z.string() }),
            409: z.object({ status: z.literal(409), message: z.string() }),
          },
        },
      },
      async ({ body, getCurrentUserId, params }, reply) => {
        await getCurrentUserId()

        const editEvent = makeEditEventUseCase()

        const result = await editEvent.execute({ ...body, ...params })

        if (result.isLeft()) {
          const error = result.value

          switch (error.constructor) {
            case ResourceNotFoundError:
              return reply
                .status(404)
                .send({ message: error.message, status: 404 })
            case MethodInvalidError:
              return reply
                .status(409)
                .send({ message: error.message, status: 409 })
            default:
              return reply.send()
          }
        }
        return reply.status(200).send()
      }
    )
}
