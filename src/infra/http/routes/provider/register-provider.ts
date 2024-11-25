import { ResourceAlreadyExistsError } from '@/core/errors/resource-already-exists-error'
import { RegisterProviderUseCase } from '@/domain/atlas-api/application/use-cases/register-provider-use-case'
import { BcryptHasher } from '@/infra/criptography/bcrypt-hasher'
import { DrizzleProviderRepository } from '@/infra/db/repositories/drizzle-provider-repository'
import { validatorCPF } from '@/utils/cpf-validator'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

function makeRegisterProviderUseCase() {
  const providerRepository = new DrizzleProviderRepository()
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
          education: z.string().optional(),
          description: z.string().optional(),
        }),
        response: {
          201: z.never(),
          400: z.string(),
          409: z.string(),
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
            return reply.status(409).send(error.message)
          default:
            return reply.status(400).send(error.message)
        }
      }

      return reply.status(201).send()
    }
  )
}
