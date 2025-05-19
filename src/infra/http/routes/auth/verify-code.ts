import { PrismaAuthCodeRepository } from '@/infra/db/repositories/prisma-auth-code-repository'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { UnauthorizedError } from '../_errors/unauthorized-error'
import { getPrismaClient } from '@/infra/db/prisma'
import { VerifyCodeUseCase } from '@/infra/verify-code-use-case'

function makeVerifyCodeUseCase() {
  const prisma = getPrismaClient()
  const authCodeRepository = new PrismaAuthCodeRepository(prisma)
  return new VerifyCodeUseCase(authCodeRepository)
}

export async function VerifyCodeRouter(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/session/verify-code',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Verify code.',
        body: z.object({
          code: z.string(),
        }),
        response: {
          200: z.never(),
          401: z.object({ status: z.literal(401), message: z.string() }),
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
            return reply
              .status(401)
              .send({ message: error.message, status: 401 })
          default:
            return reply.send()
        }
      }

      return reply.status(200).send()
    }
  )
}
