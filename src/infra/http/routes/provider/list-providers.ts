// import { z } from 'zod'

// import type { FastifyInstance } from 'fastify'
// import type { ZodTypeProvider } from 'fastify-type-provider-zod'
// import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
// import { UpdateProviderUseCase } from '@/domain/atlas-api/application/use-cases/update-provider-use-case'
// import { PrismaProviderRepository } from '@/infra/db/repositories/prisma-provider-repository'
// import { getPrismaClient } from '@/infra/db/prisma'

// function makeUpdateProviderUseCase() {
//   const prisma = getPrismaClient()
//   const providerRepository = new PrismaProviderRepository(prisma)
//   return new UpdateProviderUseCase(providerRepository)
// }

// export async function listProviders(app: FastifyInstance) {
//   app.withTypeProvider<ZodTypeProvider>().get(
//     '/providers',
//     {
//       schema: {
//         tags: ['Provider'],
//         summary: 'List providers.',
//         security: [{ bearerAuth: [] }],
//         querystring: z.object({
//           name: z.string().optional(),
//           specialty: z.string().optional(),
//           amount: z.coerce.number(),
//           limit: z.coerce.number(),
//         }),
//         response: {
//           200: z.never(),
//           400: z.string(),
//           404: z.string(),
//         },
//       },
//     },
//     async ({ body, params }, reply) => {
//       const updateProviderUseCase = makeUpdateProviderUseCase()

//       const result = await updateProviderUseCase.execute({})

//       if (result.isLeft()) {
//         const error = result.value

//         switch (error.constructor) {
//           case ResourceNotFoundError:
//             throw reply.status(404).send(error.message)
//           default:
//             throw reply.status(400).send(error.message)
//         }
//       }

//       return reply.status(200).send()
//     }
//   )
// }
