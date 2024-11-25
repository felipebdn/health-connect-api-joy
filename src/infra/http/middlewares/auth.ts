import type { FastifyInstance } from 'fastify'
import { fastifyPlugin as fp } from 'fastify-plugin'
import { UnauthorizedError } from '../routes/_errors/unauthorized-error'

export const auth = fp(async (app: FastifyInstance) => {
  app.addHook('preHandler', async (request) => {
    request.getCurrentUserId = async () => {
      try {
        const { sub } = await request.jwtVerify<{ sub: string }>()
        return sub
      } catch {
        throw new UnauthorizedError()
      }
    }
  })
})
