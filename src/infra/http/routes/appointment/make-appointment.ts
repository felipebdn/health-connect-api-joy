import { z } from 'zod'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { PrismaAppointmentRepository } from '@/infra/db/repositories/prisma-appointment-repository'
import { PrismaEventRepository } from '@/infra/db/repositories/prisma-events-repository'
import { MakeAppointmentUseCase } from '@/domain/atlas-api/application/use-cases/make-appointment-use-case'
import { EmailJsService } from '@/infra/email/emailjs-service'
import { PrismaProviderRepository } from '@/infra/db/repositories/prisma-provider-repository'
import { EmailNotSent } from '@/domain/atlas-api/application/errors/email-not-sent'
import { MethodInvalidError } from '@/domain/atlas-api/application/errors/method-invalid-error'
import { getPrismaClient } from '@/infra/db/prisma'
import { PrismaPatientRepository } from '@/infra/db/repositories/prisma-patient-repository'

function makeMakeAppointmentUseCase() {
  const prisma = getPrismaClient()
  const eventRepository = new PrismaEventRepository(prisma)
  const appointmentRepository = new PrismaAppointmentRepository(prisma)
  const providerRepository = new PrismaProviderRepository(prisma)
  const patientRepository = new PrismaPatientRepository(prisma)
  const emailService = new EmailJsService()
  return new MakeAppointmentUseCase(
    eventRepository,
    appointmentRepository,
    providerRepository,
    patientRepository,
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
          patientId: z.string(),
          date: z.coerce.date().optional(),
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
      return reply.status(201).send({
        appointment_id: appointment.id.toString(),
        event_id: appointment.eventId.toString(),
      })
    }
  )
}
