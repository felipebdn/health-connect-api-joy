import { WrongCredentialsError } from '@/domain/atlas-api/application/errors/wrong-credentials-error'
import { AuthenticateUseCase } from '@/domain/atlas-api/application/use-cases/authenticate-provider-use-case'
import { BcryptHasher } from '@/infra/criptography/bcrypt-hasher'
import { getPrismaClient } from '@/infra/db/prisma'
import { PrismaInstitutionRepository } from '@/infra/db/repositories/prisma-instituition-repository'
import { PrismaPatientRepository } from '@/infra/db/repositories/prisma-patient-repository'
import { PrismaProviderRepository } from '@/infra/db/repositories/prisma-provider-repository'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

function makeAuthenticateUseCase() {
  const prisma = getPrismaClient()
  const providerRepository = new PrismaProviderRepository(prisma)
  const institutionRepository = new PrismaInstitutionRepository(prisma)
  const patientRepository = new PrismaPatientRepository(prisma)
  const bcryptHasher = new BcryptHasher()
  const authenticateUseCase = new AuthenticateUseCase(
    providerRepository,
    institutionRepository,
    patientRepository,
    bcryptHasher
  )

  return authenticateUseCase
}

export async function AuthenticateRouter(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/session',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Authenticate a user.',
        body: z.object({
          email: z.string().email(),
          password: z.string().min(1, {
            message: 'Password is not empty.',
          }),
          type: z.enum(['PATIENT', 'INSTITUTION', 'PROVIDER']),
        }),
        response: {
          200: z.object({
            accessToken: z.string(),
          }),
          400: z.string(),
          401: z.string(),
        },
      },
    },
    async ({ body }, reply) => {
      const authenticateUseCase = makeAuthenticateUseCase()

      const result = await authenticateUseCase.execute(body.type, {
        email: body.email,
        password: body.password,
      })

      if (result.isLeft()) {
        const error = result.value

        switch (error.constructor) {
          case WrongCredentialsError: {
            return reply.status(401).send(error.message)
          }
          default:
            return reply.status(400).send(error.message)
        }
      }

      const accessToken = await reply.jwtSign(
        {
          sub: result.value.user.id.toString(),
          rule: body.type,
        },
        {
          sign: { expiresIn: '7d' },
        }
      )

      return reply.status(200).send({ accessToken })
    }
  )
}
