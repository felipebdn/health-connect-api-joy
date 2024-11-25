import { VerifyCodeUseCase } from '@/domain/atlas-api/application/use-cases/verify-code-use-case'
import { DrizzleAuthCodeRepository } from '@/infra/db/repositories/drizzle-auth-code-repository'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { UnauthorizedError } from '../_errors/unauthorized-error'

function makeVerifyCodeUseCase() {
  const authCodeRepository = new DrizzleAuthCodeRepository()
  return new VerifyCodeUseCase(authCodeRepository)
}

export async function VerifyCodeRouter(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/session/verify-code',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Register a new provider.',
        body: z.object({
          code: z.string(),
        }),
        response: {
          200: z.never(),
          400: z.string(),
          401: z.string(),
        },
      },
    },
    async ({ body }, reply) => {
      const verifyCode = makeVerifyCodeUseCase()

      const result = await verifyCode.execute({ ...body })

      if (result.isLeft()) {
        const error = result.value

        switch (error.constructor) {
          case UnauthorizedError:
            return reply.status(401).send(error.message)
          default:
            return reply.status(400).send(error.message)
        }
      }

      return reply.status(200).send()
    }
  )
}
