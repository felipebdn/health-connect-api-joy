import { z } from 'zod'

import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { getPrismaClient } from '@/infra/db/prisma'
import { ProviderPresenter } from '@/infra/db/presenters/provider-presenter'
import { PrismaProviderEventRepository } from '@/infra/db/repositories/prisma-provider-event-repository'
import { RatingPresenter } from '@/infra/db/presenters/rating-presenter'
import { ListProvidersByInstitutionUseCase } from '@/domain/atlas-api/application/use-cases/list-providers-by-institution-use-case'
import { AppointmentPresenter } from '@/infra/db/presenters/appointments-presenter'
import { EventPresenter } from '@/infra/db/presenters/event-presenter'
import {
  AffiliationPresenter,
  AffiliationPresenterSchema,
} from '@/infra/db/presenters/affiliation-presenter'

function makeListProvidersUseCase() {
  const prisma = getPrismaClient()
  const providerEventRepository = new PrismaProviderEventRepository(prisma)
  return new ListProvidersByInstitutionUseCase(providerEventRepository)
}

export async function listProvidersByInstitution(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/institution/:institutionId/providers',
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ['Institution'],
        summary: 'List providers by institution id.',
        params: z.object({
          institutionId: z.string(),
        }),
        querystring: z.object({
          occupation: z.string().optional(),
          specialty: z.string().optional(),
        }),
        response: {
          200: z.object({
            providers: z.array(
              z.object({
                provider: z.object({
                  id: z.string(),
                  name: z.string(),
                  email: z.string(),
                  providerCode: z.string(),
                  cpf: z.string(),
                  occupation: z.string(),
                  phone: z.string(),
                  duration: z.coerce.number(),
                  nextAvailability: z.coerce.date().optional(),
                  birthday: z.coerce.date(),
                  price: z.coerce.number(),
                  specialty: z.string(),
                  education: z.string().optional(),
                  description: z.string().optional(),
                }),
                appointments: z.array(
                  z.object({
                    appointment: z.object({
                      id: z.string(),
                      providerId: z.string(),
                      eventId: z.string(),
                      institutionId: z.string().optional(),
                      patientId: z.string(),
                      description: z.string().optional(),
                      createdAt: z.coerce.date(),
                    }),
                    event: z.object({
                      Id: z.string(),
                      providerId: z.string(),
                      Title: z.enum(['appointment', 'availability']),
                      Start: z.coerce.date(),
                      End: z.coerce.date(),
                      StartTimezone: z.string(),
                      EndTimezone: z.string(),
                      RecurrenceRule: z.string().optional(),
                      RecurrenceID: z.string().optional(),
                      RecurrenceException: z.string().optional(),
                    }),
                  })
                ),
                ratings: z.array(
                  z.object({
                    id: z.string(),
                    providerId: z.string(),
                    appointmentId: z.string(),
                    patientId: z.string(),
                    rating: z.coerce.number(),
                    name: z.string(),
                    description: z.string().optional(),
                    createdAt: z.coerce.date(),
                  })
                ),
                affiliation: AffiliationPresenterSchema,
              })
            ),
          }),
        },
      },
    },
    async ({ query, params }, reply) => {
      const listProvidersUseCase = makeListProvidersUseCase()

      const { occupation, specialty } = query
      const { institutionId } = params

      const result = await listProvidersUseCase.execute({
        institutionId,
        occupation,
        specialty,
      })

      return reply.status(200).send({
        providers: result.providers.map((item) => ({
          provider: ProviderPresenter.toHTTP(item.provider),
          appointments: item.appointments.map((item) => ({
            appointment: AppointmentPresenter.toHTTP(item.appointment),
            event: EventPresenter.toHTTP(item.event),
          })),
          ratings: item.ratings.map(RatingPresenter.toHTTP),
          affiliation: AffiliationPresenter.toHTTP(item.affiliation),
        })),
      })
    }
  )
}
