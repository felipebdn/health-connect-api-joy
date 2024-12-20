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
            endTimezone: z.string(),
            recurrenceRule: z.string().optional(),
            currentStartTime: z.coerce.date().optional(),
          }),
          params: z.object({
            eventId: z.string(),
          }),
          response: {
            200: z.never(),
            400: z.string(),
            404: z.string(),
            409: z.string(),
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
              return reply.status(404).send(error.message)
            case MethodInvalidError:
              return reply.status(409).send(error.message)
            default:
              return reply.status(400).send(error.message)
          }
        }
        return reply.status(200).send()
      }
    )
}
