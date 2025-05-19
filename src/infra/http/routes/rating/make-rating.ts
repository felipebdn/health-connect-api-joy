import { ResourceAlreadyExistsError } from '@/core/errors/resource-already-exists-error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { MakeRatingUseCase } from '@/domain/atlas-api/application/use-cases/make-rating-use-case'
import { getPrismaClient } from '@/infra/db/prisma'
import { PrismaAppointmentRepository } from '@/infra/db/repositories/prisma-appointment-repository'
import { PrismaPatientRepository } from '@/infra/db/repositories/prisma-patient-repository'
import { PrismaProviderRepository } from '@/infra/db/repositories/prisma-provider-repository'
import { PrismaRatingRepository } from '@/infra/db/repositories/prisma-rating-repository'
import { response409 } from '@/infra/swagger/responses'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

function makeNewRatingUseCase() {
  const prisma = getPrismaClient()
  const providerRepository = new PrismaProviderRepository(prisma)
  const appointmentRepository = new PrismaAppointmentRepository(prisma)
  const patientRepository = new PrismaPatientRepository(prisma)
  const ratingRepository = new PrismaRatingRepository(prisma)
  return new MakeRatingUseCase(
    providerRepository,
    appointmentRepository,
    patientRepository,
    ratingRepository
  )
}

export async function NewRatingRouter(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/rating',
    {
      schema: {
        tags: ['Rating'],
        summary: 'Register a new rating.',
        body: z.object({
          appointmentId: z.string(),
          patientId: z.string(),
          providerId: z.string(),
          description: z.string().optional(),
          rating: z
            .number()
            .min(1, { message: 'Min 1' })
            .max(5, { message: 'Max 5' }),
        }),
        response: {
          201: z.never(),
          404: z.object({ status: z.literal(404), message: z.string() }),
          409: z.object({ status: z.literal(409), message: z.string() }),
        },
      },
    },
    async ({ body }, reply) => {
      const newRating = makeNewRatingUseCase()

      const result = await newRating.execute(body)

      if (result.isLeft()) {
        const error = result.value

        switch (error.constructor) {
          case ResourceNotFoundError:
            return reply
              .status(404)
              .send({ message: error.message, status: 404 })
          case ResourceAlreadyExistsError:
            return reply
              .status(409)
              .send({ message: error.message, status: 409 })
          default:
            return reply.send()
        }
      }

      return reply.status(201).send()
    }
  )
}
