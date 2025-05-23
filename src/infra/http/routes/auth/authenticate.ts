import { WrongCredentialsError } from '@/domain/atlas-api/application/errors/wrong-credentials-error'
import { AuthenticateUseCase } from '@/domain/atlas-api/application/use-cases/authenticate-use-case'
import { getPrismaClient } from '@/infra/db/prisma'
import { PrismaInstitutionRepository } from '@/infra/db/repositories/prisma-institution-repository'
import { PrismaPatientRepository } from '@/infra/db/repositories/prisma-patient-repository'
import { PrismaProviderRepository } from '@/infra/db/repositories/prisma-provider-repository'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { Provider } from '@/domain/atlas-api/enterprise/entities/provider'
import { BcryptHasher } from '@/infra/criptography/bcrypt-hasher'

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
            id: z.string(),
            name: z.string(),
            duration: z.coerce.number().optional(),
          }),
          401: z.object({ status: z.literal(401), message: z.string() }),
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
            return reply
              .status(401)
              .send({ status: 401, message: error.message })
          }
          default:
            return reply.send()
        }
      }

      const accessToken = await reply.jwtSign(
        {
          sub: result.value.user.id.toString(),
          role: body.type,
        },
        {
          sign: { expiresIn: '7d' },
        }
      )

      let user: {
        id: string
        name: string
        duration?: number
      }

      if (result.value.user instanceof Provider) {
        user = {
          id: result.value.user.id.toValue(),
          name: result.value.user.name,
          duration: result.value.user.duration,
        }
      } else {
        user = {
          id: result.value.user.id.toValue(),
          name: result.value.user.name,
          duration: undefined,
        }
      }

      return reply
        .code(200)
        .setCookie('atlas.access_token', accessToken, {
          maxAge: 1000 * 60 * 60 * 24 * 7,
          path: '/',
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          // secure: process.env.NODE_ENV === 'production',
        })
        .send(user)
    }
  )
}
