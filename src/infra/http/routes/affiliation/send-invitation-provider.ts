import { ResourceAlreadyExistsError } from '@/core/errors/resource-already-exists-error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { SendInvitationProviderUseCase } from '@/domain/atlas-api/application/use-cases/send-invitation-provider-use-case'
import { getPrismaClient } from '@/infra/db/prisma'
import { PrismaAffiliationRepository } from '@/infra/db/repositories/prisma-affiliation-repository'
import { PrismaInstitutionRepository } from '@/infra/db/repositories/prisma-institution-repository'
import { PrismaProviderRepository } from '@/infra/db/repositories/prisma-provider-repository'
import { ResendService } from '@/infra/email/emailjs-service'
import { response409 } from '@/infra/swagger/responses'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'
import { PrismaAffiliationCodeRepository } from '@/infra/db/repositories/prisma-affiliation-code-repository'

function makeSendInvitationProviderUseCase() {
  const prisma = getPrismaClient()
  const providerRepository = new PrismaProviderRepository(prisma)
  const institutionRepository = new PrismaInstitutionRepository(prisma)
  const affiliationRepository = new PrismaAffiliationRepository(prisma)
  const affiliationCode = new PrismaAffiliationCodeRepository(prisma)
  const resendService = new ResendService()
  return new SendInvitationProviderUseCase(
    providerRepository,
    institutionRepository,
    affiliationRepository,
    affiliationCode,
    resendService
  )
}

export async function SendInvitationProviderRouter(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/institution/invitation',
    {
      schema: {
        tags: ['Institution'],
        summary: 'Send invitation to provider.',
        body: z.object({
          institutionId: z.string(),
          emailProvider: z.string().email(),
        }),
        response: {
          201: z.never(),
          400: z.object({ status: z.literal(400), message: z.string() }),
          404: z.object({ status: z.literal(404), message: z.string() }),
          409: response409,
        },
      },
    },
    async ({ body }, reply) => {
      const sendInvitationProvider = makeSendInvitationProviderUseCase()

      const result = await sendInvitationProvider.execute(body)

      if (result.isLeft()) {
        const error = result.value

        if (error instanceof BadRequestError) {
          return reply
            .status(400)
            .send({ message: 'Email não enviado', status: 400 })
        }

        if (error instanceof ResourceNotFoundError) {
          return reply.status(404).send({ message: error.message, status: 404 })
        }

        if (error instanceof ResourceAlreadyExistsError) {
          return reply.status(409).send(error.toJSON())
        }
      }

      return reply.status(201).send()
    }
  )
}
