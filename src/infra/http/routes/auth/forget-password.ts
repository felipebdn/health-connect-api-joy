import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { ForgetPasswordUseCase } from '@/domain/atlas-api/application/use-cases/forget-password-use-case'
import { DrizzleAuthCodeRepository } from '@/infra/db/repositories/drizzle-auth-code-repository'
import { DrizzleProviderRepository } from '@/infra/db/repositories/drizzle-provider-repository'
import { EmailJsService } from '@/infra/email/emailjs-service'

function makeForgetPasswordUseCase() {
  const providerRepository = new DrizzleProviderRepository()
  const authCodeRepository = new DrizzleAuthCodeRepository()
  const emailJsService = new EmailJsService()
  return new ForgetPasswordUseCase(
    providerRepository,
    authCodeRepository,
    emailJsService
  )
}

export async function ForgetPasswordRouter(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/session/forgot-password',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Request password recovery.',
        body: z.object({
          email: z.string().email({
            message: 'Email invalid',
          }),
          url: z.string().url(),
        }),
        response: {
          200: z.never(),
          400: z.string(),
          404: z.string(),
        },
      },
    },
    async ({ body }, reply) => {
      const forgetPassword = makeForgetPasswordUseCase()

      const result = await forgetPassword.execute({
        email: body.email,
        URL_REDIRECT: body.url,
      })

      if (result.isLeft()) {
        const error = result.value

        switch (error.constructor) {
          case ResourceNotFoundError:
            return reply.status(404).send(error.message)
          default:
            return reply.status(400).send(error.message)
        }
      }
      return reply.status(200).send()
    }
  )
}
