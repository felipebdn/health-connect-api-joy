import { z } from 'zod'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { AppointmentPresenter } from '@/infra/db/presenters/appointments-presenter'
import { EventPresenter } from '@/infra/db/presenters/event-presenter'
import { getPrismaClient } from '@/infra/db/prisma'
import { PatientPresenter } from '@/infra/db/presenters/patient-presenter'
import { ListAppointmentsDayUseCase } from '@/domain/atlas-api/application/use-cases/list-appointments-day-use-case'
import { PrismaAppointmentEventPatientRepository } from '@/infra/db/repositories/prisma-appointment-event-patient-repository'
import { ProviderPresenter } from '@/infra/db/presenters/provider-presenter'

function makeListAppointmentsDayUseCase() {
  const prisma = getPrismaClient()
  const appointmentEventPatientRepository =
    new PrismaAppointmentEventPatientRepository(prisma)
  return new ListAppointmentsDayUseCase(appointmentEventPatientRepository)
}

export async function ListAppointmentsRouter(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/appointments/:day',
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ['Appointment'],
        summary: 'List appointments.',
        params: z.object({
          day: z.coerce.date(),
        }),
        querystring: z.object({
          institutionId: z.string().optional(),
        }),
        response: {
          200: z.array(
            z.object({
              id: z.string(),
              providerId: z.string(),
              eventId: z.string(),
              institutionId: z.string().optional(),
              patientId: z.string(),
              description: z.string().optional(),
              createdAt: z.coerce.date(),
              provider: z.object({
                id: z.string(),
                name: z.string(),
                email: z.string(),
                providerCode: z.string(),
                cpf: z.string(),
                occupation: z.string(),
                phone: z.string(),
                duration: z.coerce.number(),
                birthday: z.coerce.date(),
                price: z.coerce.number(),
                specialty: z.string(),
                nextAvailability: z.coerce.date().optional(),
                education: z.string().optional(),
                description: z.string().optional(),
              }),
              patient: z.object({
                id: z.string(),
                name: z.string(),
                email: z.string(),
                phone: z.string(),
                birthday: z.coerce.date(),
                addressId: z.string().optional(),
              }),
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
            })
          ),
          404: z.object({ status: z.literal(404), message: z.string() }),
        },
      },
    },
    async ({ params, query }, reply) => {
      const getAppointment = makeListAppointmentsDayUseCase()
      const result = await getAppointment.execute({
        day: params.day,
        institutionId: query.institutionId,
      })

      if (!result.isRight()) {
        return reply.send()
      }
      return reply.status(200).send(
        result.value.appointments.map((item) => ({
          event: EventPresenter.toHTTP(item.event),
          patient: PatientPresenter.toHTTP(item.patient),
          provider: ProviderPresenter.toHTTP(item.provider),
          ...AppointmentPresenter.toHTTP(item.appointment),
        }))
      )
    }
  )
}
