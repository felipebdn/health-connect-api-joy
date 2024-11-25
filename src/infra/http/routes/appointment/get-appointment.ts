import { z } from 'zod'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { AppointmentPresenter } from '@/infra/db/presenters/appointments-presenter'
import { EventPresenter } from '@/infra/db/presenters/event-presenter'
import { GetAppointmentUseCase } from '@/domain/atlas-api/application/use-cases/get-appointment-use-case'
import { DrizzleAppointmentRepository } from '@/infra/db/repositories/drizzle-appointment-repository'
import { DrizzleEventRepository } from '@/infra/db/repositories/drizzle-events-repository'

function makeGetAppointmentUseCase() {
  const appointmentRepository = new DrizzleAppointmentRepository()
  const eventRepository = new DrizzleEventRepository()
  return new GetAppointmentUseCase(
    appointmentRepository,
    eventRepository
  )
}

export async function GetAppointmentRouter(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/appointment/:eventId',
    {
      schema: {
        tags: ['Appointment'],
        summary: 'Find an appointment.',
        params: z.object({
          eventId: z.string(),
        }),
        response: {
          200: z.object({
            appointment: z.object({
              id: z.string(),
              providerId: z.string(),
              eventId: z.string(),
              name: z.string(),
              email: z.string(),
              cpf: z.string(),
              phone: z.string(),
              description: z.string().nullable(),
              event: z.object({
                Id: z.string(),
                providerId: z.string(),
                Title: z.enum(['appointment', 'availability']),
                Start: z.date(),
                End: z.date(),
                StartTimezone: z.string(),
                EndTimezone: z.string(),
                RecurrenceRule: z.string().optional(),
                RecurrenceID: z.string().optional(),
                RecurrenceException: z.string().optional(),
              }),
            }),
          }),
          400: z.string(),
          404: z.string(),
        },
      },
    },
    async ({ params }, reply) => {
      const getAppointment = makeGetAppointmentUseCase()
      const result = await getAppointment.execute({ eventId: params.eventId })

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
        appointment: {
          ...AppointmentPresenter.toHTTP(result.value.appointment),
          event: EventPresenter.toHTTP(result.value.event),
        },
      })
    }
  )
}
