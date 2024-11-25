import { z } from 'zod'

import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { auth } from '../../middlewares/auth'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { DrizzleProviderRepository } from '@/infra/db/repositories/drizzle-provider-repository'
import { NewPasswordUseCase } from '@/domain/atlas-api/application/use-cases/new-password-use-case'
import { DrizzleAuthCodeRepository } from '@/infra/db/repositories/drizzle-auth-code-repository'
import { BcryptHasher } from '@/infra/criptography/bcrypt-hasher'
import { UnauthorizedError } from '../_errors/unauthorized-error'
import { ConflictActionError } from '@/domain/atlas-api/application/use-cases/errors/conflit-errror-action'

function makeNewPasswordUseCase() {
  const providerRepository = new DrizzleProviderRepository()
  const authCodeRepository = new DrizzleAuthCodeRepository()
  const bcryptHasher = new BcryptHasher()
  return new NewPasswordUseCase(
    providerRepository,
    authCodeRepository,
    bcryptHasher,
    bcryptHasher
  )
}

export async function NewPasswordRouter(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch(
      '/new-password',
      {
        schema: {
          tags: ['Provider'],
          summary: 'Create a new password.',
          security: [{ bearerAuth: [] }],
          body: z.object({
            password: z.string().min(1, { message: 'Name is not empty.' }),
          }),
          querystring: z.object({
            code: z.string(),
          }),
          response: {
            200: z.never(),
            400: z.string(),
            401: z.string(),
            404: z.string(),
            409: z.string(),
          },
        },
      },
      async ({ body, query, getCurrentUserId }, reply) => {
        await getCurrentUserId()

        const newPasswordUseCase = makeNewPasswordUseCase()

        const result = await newPasswordUseCase.execute({ ...body, ...query })

        if (result.isLeft()) {
          const error = result.value

          switch (error.constructor) {
            case UnauthorizedError:
              return reply.status(401).send(error.message)
            case ConflictActionError:
              return reply.status(409).send(error.message)
            case ResourceNotFoundError:
              return reply.status(404).send(error.message)
            default:
              return reply.status(400).send(error.message)
          }
        }

        return reply.status(200)
      }
    )
}
