import { ResourceAlreadyExistsError } from '@/core/errors/resource-already-exists-error'
import { RegisterPatientUseCase } from '@/domain/atlas-api/application/use-cases/register-patient-use-case'
import { BcryptHasher } from '@/infra/criptography/bcrypt-hasher'
import { getPrismaClient } from '@/infra/db/prisma'
import { PrismaPatientRepository } from '@/infra/db/repositories/prisma-patient-repository'
import { response409 } from '@/infra/swagger/responses'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

function makeRegisterPatientUseCase() {
  const prisma = getPrismaClient()
  const patientRepository = new PrismaPatientRepository(prisma)
  const bcryptHasher = new BcryptHasher()
  return new RegisterPatientUseCase(patientRepository, bcryptHasher)
}

export async function RegisterPatientRouter(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/patient/register',
    {
      schema: {
        tags: ['Patient'],
        summary: 'Register a new patient.',
        body: z.object({
          name: z.string().min(1, { message: 'Name is not empty.' }),
          email: z.string().email(),
          cpf: z.string(),
          password: z.string().min(1, { message: 'Password is not empty.' }),
          phone: z.string(),
          birthday: z.coerce.date(),
        }),
        response: {
          201: z.never(),
          409: response409,
        },
      },
    },
    async ({ body }, reply) => {
      const registerPatient = makeRegisterPatientUseCase()

      const result = await registerPatient.execute({ ...body })

      if (result.isLeft()) {
        const error = result.value

        switch (error.constructor) {
          case ResourceAlreadyExistsError:
            return reply.status(409).send(error.toJSON())
          default:
            return reply.send()
        }
      }

      return reply.status(201).send()
    }
  )
}
