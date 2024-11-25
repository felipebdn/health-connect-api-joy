import { z } from 'zod'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { DrizzleAppointmentRepository } from '@/infra/db/repositories/drizzle-appointment-repository'
import { DrizzleEventRepository } from '@/infra/db/repositories/drizzle-events-repository'
import { MakeAppointmentUseCase } from '@/domain/atlas-api/application/use-cases/make-appointment-use-case'
import { EmailJsService } from '@/infra/email/emailjs-service'
import { DrizzleProviderRepository } from '@/infra/db/repositories/drizzle-provider-repository'
import { EmailNotSent } from '@/domain/atlas-api/application/errors/email-not-sent'
import { MethodInvalidError } from '@/domain/atlas-api/application/errors/method-invalid-error'

function makeMakeAppointmentUseCase() {
  const eventRepository = new DrizzleEventRepository()
  const appointmentRepository = new DrizzleAppointmentRepository()
  const providerRepository = new DrizzleProviderRepository()
  const emailService = new EmailJsService()
  return new MakeAppointmentUseCase(
    eventRepository,
    appointmentRepository,
    providerRepository,
    emailService
  )
}

export async function MakeAppointmentRouter(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/appointment/new',
    {
      schema: {
        tags: ['Appointment'],
        summary: 'Make an appointment.',
        body: z.object({
          providerId: z.string(),
          eventId: z.string(),
          date: z.coerce.date().optional(),
          name: z.string(),
          email: z.string(),
          cpf: z.string(),
          phone: z.string(),
          description: z.string().optional(),
        }),
        response: {
          200: z.object({
            appointment_id: z.string(),
            event_id: z.string(),
          }),
          400: z.string(),
          404: z.string(),
        },
      },
    },
    async ({ body }, reply) => {
      const makeAppointment = makeMakeAppointmentUseCase()
      const result = await makeAppointment.execute({ ...body })

      if (result.isLeft()) {
        const error = result.value

        switch (error.constructor) {
          case ResourceNotFoundError:
            return reply.status(404).send(error.message)
          case EmailNotSent:
            return reply.status(400).send(error.message)
          case MethodInvalidError:
            return reply.status(409).send(error.message)
          default:
            return reply.status(400).send(error.message)
        }
      }
      const appointment = result.value.appointment
      return reply.status(200).send({
        appointment_id: appointment.id.toString(),
        event_id: appointment.eventId.toString(),
      })
    }
  )
}
