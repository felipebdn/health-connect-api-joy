import { z } from 'zod'

import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

export async function LogoutRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/auth/logout',
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ['Auth'],
        summary: 'Sign out user.',
        response: {
          200: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (_, reply) => {
      reply
        .status(200)
        .clearCookie('atlas.access_token')
        .send({ message: 'Logout realizado com sucesso' })
    }
  )
}
