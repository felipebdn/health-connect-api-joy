import { ResourceAlreadyExistsError } from '@/core/errors/resource-already-exists-error'
import { RegisterProviderUseCase } from '@/domain/atlas-api/application/use-cases/register-provider-use-case'
import { BcryptHasher } from '@/infra/criptography/bcrypt-hasher'
import { getPrismaClient } from '@/infra/db/prisma'
import { PrismaProviderRepository } from '@/infra/db/repositories/prisma-provider-repository'
import { response409 } from '@/infra/swagger/responses'
import { validatorCPF } from '@/utils/cpf-validator'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

function makeRegisterProviderUseCase() {
  const prisma = getPrismaClient()
  const providerRepository = new PrismaProviderRepository(prisma)
  const bcryptHasher = new BcryptHasher()
  return new RegisterProviderUseCase(providerRepository, bcryptHasher)
}

export async function RegisterProviderRouter(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/provider/register',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Register a new provider.',
        body: z.object({
          name: z.string().min(1, { message: 'Name is not empty.' }),
          email: z.string().email(),
          phone: z.string(),
          providerCode: z.string(),
          birthday: z.coerce.date(),
          price: z.coerce.number(),
          duration: z.coerce.number(),
          cpf: z
            .string()
            .refine((value) => validatorCPF(value), {
              message: '[CPF] Invalid.',
            })
            .transform((value) => value.replace(/[^\d]/g, '')),
          password: z.string().min(1, { message: 'Password is not empty.' }),
          specialty: z.string().min(1, {
            message: 'Specialty is not empty.',
          }),
          occupation: z.string().min(1, {
            message: 'Occupation is not empty.',
          }),
          education: z.string().optional(),
          description: z.string().optional(),
        }),
        response: {
          201: z.never(),
          409: response409,
        },
      },
    },
    async ({ body }, reply) => {
      const registerProvider = makeRegisterProviderUseCase()

      const result = await registerProvider.execute({ ...body })

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
