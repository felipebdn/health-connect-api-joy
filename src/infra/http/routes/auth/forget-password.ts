import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { ForgetPasswordUseCase } from '@/domain/atlas-api/application/use-cases/forget-password-use-case'
import { PrismaAuthCodeRepository } from '@/infra/db/repositories/prisma-auth-code-repository'
import { PrismaProviderRepository } from '@/infra/db/repositories/prisma-provider-repository'
import { getPrismaClient } from '@/infra/db/prisma'
import { PrismaPatientRepository } from '@/infra/db/repositories/prisma-patient-repository'
import { PrismaInstitutionRepository } from '@/infra/db/repositories/prisma-institution-repository'
import { ResendService } from '@/infra/email/emailjs-service'

function makeForgetPasswordUseCase() {
  const prisma = getPrismaClient()
  const providerRepository = new PrismaProviderRepository(prisma)
  const institutionRepository = new PrismaInstitutionRepository(prisma)
  const patientRepository = new PrismaPatientRepository(prisma)
  const authCodeRepository = new PrismaAuthCodeRepository(prisma)
  const resendService = new ResendService()
  return new ForgetPasswordUseCase(
    providerRepository,
    institutionRepository,
    patientRepository,
    authCodeRepository,
    resendService
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
          entity: z.enum(['INSTITUTION', 'PROVIDER', 'PATIENT']),
        }),
        response: {
          200: z.never(),
          404: z.object({ status: z.literal(404), message: z.string() }),
        },
      },
    },
    async ({ body }, reply) => {
      const forgetPassword = makeForgetPasswordUseCase()

      const result = await forgetPassword.execute({
        email: body.email,
        URL_REDIRECT: body.url,
        entity: body.entity,
      })

      if (result.isLeft()) {
        const error = result.value

        switch (error.constructor) {
          case ResourceNotFoundError:
            return reply
              .status(404)
              .send({ message: error.message, status: 404 })
        }
      }
      return reply.status(200).send()
    }
  )
}
