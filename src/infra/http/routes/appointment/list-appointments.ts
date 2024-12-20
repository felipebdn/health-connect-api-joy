import { z } from 'zod'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { AppointmentPresenter } from '@/infra/db/presenters/appointments-presenter'
import { ListAppointmentsEmailCPFUseCase } from '@/domain/atlas-api/application/use-cases/list-appointments-cpf-email-use-case'
import { PrismaAppointmentRepository } from '@/infra/db/repositories/prisma-appointment-repository'
import { getPrismaClient } from '@/infra/db/prisma'

function makeListAppointmentsEmailCpfUseCase() {
  const prisma = getPrismaClient()
  const appointmentRepository = new PrismaAppointmentRepository(prisma)
  const listAppointmentsEmailCPF = new ListAppointmentsEmailCPFUseCase(
    appointmentRepository
  )

  return listAppointmentsEmailCPF
}

export async function ListAppointmentsRouter(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/appointment/list',
    {
      schema: {
        tags: ['Appointment'],
        summary: 'List appointments.',
        querystring: z.object({
          email: z.string().optional(),
          cpf: z.string().optional(),
        }),
        response: {
          200: z.object({
            appointments: z.array(
              z.object({
                id: z.string(),
                providerId: z.string(),
                eventId: z.string(),
                name: z.string(),
                email: z.string(),
                cpf: z.string(),
                phone: z.string(),
                description: z.string().nullable(),
              })
            ),
          }),
          400: z.string(),
          404: z.string(),
        },
      },
    },
    async ({ query: { cpf, email } }, reply) => {
      const listAppointmentsEmailCPF = makeListAppointmentsEmailCpfUseCase()

      const result = await listAppointmentsEmailCPF.execute({ cpf, email })

      if (result.isRight()) {
        return reply.status(200).send({
          appointments: result.value.appointments.map(
            AppointmentPresenter.toHTTP
          ),
        })
      }
    }
  )
}
