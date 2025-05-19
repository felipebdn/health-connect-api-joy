import { z } from 'zod'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { PrismaEventRepository } from '@/infra/db/repositories/prisma-events-repository'
import { PrismaProviderRepository } from '@/infra/db/repositories/prisma-provider-repository'
import { ListEventsProviderUseCase } from '@/domain/atlas-api/application/use-cases/list-events-provider-use-case'
import { EventPresenterWithAppointment } from '@/infra/db/presenters/event-presenter'
import { getPrismaClient } from '@/infra/db/prisma'
import { PrismaAppointmentEventPatientRepository } from '@/infra/db/repositories/prisma-appointment-event-patient-repository'

function makeListEventsProviderUseCase() {
  const prisma = getPrismaClient()
  const providerRepository = new PrismaProviderRepository(prisma)
  const eventRepository = new PrismaEventRepository(prisma)
  const appointmentEventPatientRepository =
    new PrismaAppointmentEventPatientRepository(prisma)
  return new ListEventsProviderUseCase(
    providerRepository,
    eventRepository,
    appointmentEventPatientRepository
  )
}

export async function ListEventsProviderRouter(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/provider/:providerId/events',
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ['Event'],
        summary: 'List events provider.',
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
                Institution: z.string().optional(),
                RecurrenceID: z.string().optional(),
                RecurrenceException: z.string().optional(),
              })
            ),
          }),
          404: z.object({ status: z.literal(404), message: z.string() }),
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
            return reply
              .status(404)
              .send({ message: error.message, status: 404 })
          default:
            return reply.send()
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
