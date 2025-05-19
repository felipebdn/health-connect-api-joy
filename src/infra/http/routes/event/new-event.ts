import { z } from 'zod'

import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { auth } from '../../middlewares/auth'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { PrismaEventRepository } from '@/infra/db/repositories/prisma-events-repository'
import { NewEventUseCase } from '@/domain/atlas-api/application/use-cases/new-event-use-case'
import { PrismaProviderRepository } from '@/infra/db/repositories/prisma-provider-repository'
import { SchedulesConflict } from '@/domain/atlas-api/application/errors/schedules-conflict-error'
import { getPrismaClient } from '@/infra/db/prisma'
import { PrismaInstitutionRepository } from '@/infra/db/repositories/prisma-institution-repository'

function makeNewEventUseCase() {
  const prisma = getPrismaClient()
  const eventRepository = new PrismaEventRepository(prisma)
  const providerRepository = new PrismaProviderRepository(prisma)
  const institutionRepository = new PrismaInstitutionRepository(prisma)
  return new NewEventUseCase(
    eventRepository,
    providerRepository,
    institutionRepository
  )
}

export async function NewEventRouter(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/provider/events/new',
      {
        preHandler: [app.authenticate],
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
            institutionId: z.string().optional(),
          }),
          response: {
            201: z.never(),
            404: z.object({ status: z.literal(404), message: z.string() }),
            409: z.object({ status: z.literal(409), message: z.string() }),
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
              return reply
                .status(404)
                .send({ message: error.message, status: 404 })
            case SchedulesConflict:
              return reply.status(409).send({
                message:
                  'Available time shorter than the duration of the consultation.',
                status: 409,
              })
            default:
              return reply.send()
          }
        }
        return reply.status(201).send()
      }
    )
}
