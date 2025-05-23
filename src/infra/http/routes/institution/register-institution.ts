import { ResourceAlreadyExistsError } from '@/core/errors/resource-already-exists-error'
import { RegisterInstitutionUseCase } from '@/domain/atlas-api/application/use-cases/register-institution-use-case'
import { BcryptHasher } from '@/infra/criptography/bcrypt-hasher'
import { getPrismaClient } from '@/infra/db/prisma'
import { PrismaAddressRepository } from '@/infra/db/repositories/prisma-address-repository'
import { PrismaInstitutionRepository } from '@/infra/db/repositories/prisma-institution-repository'
import { response409 } from '@/infra/swagger/responses'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

function makeRegisterInstitutionUseCase() {
  const prisma = getPrismaClient()
  const institutionRepository = new PrismaInstitutionRepository(prisma)
  const prismaAddressRepository = new PrismaAddressRepository(prisma)
  const bcryptHasher = new BcryptHasher()
  return new RegisterInstitutionUseCase(
    institutionRepository,
    prismaAddressRepository,
    bcryptHasher
  )
}

export async function RegisterInstitutionRouter(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/institution/register',
    {
      schema: {
        tags: ['Institution'],
        summary: 'Register a new institution.',
        body: z.object({
          name: z.string().min(1, { message: 'Name is not empty.' }),
          email: z.string().email(),
          phone: z.string(),
          password: z.string().min(1, { message: 'Password is not empty.' }),
          institutionName: z.string(),
          cnpj: z.string(),
          address: z.object({
            street: z.string(),
            number: z.string().optional(),
            district: z.string(),
            complement: z.string().optional(),
            zipCode: z.string(),
            city: z.string(),
            state: z.string(),
          }),
        }),
        response: {
          201: z.never(),
          409: response409,
        },
      },
    },
    async ({ body }, reply) => {
      const registerInstitution = makeRegisterInstitutionUseCase()

      const result = await registerInstitution.execute({ ...body })

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
