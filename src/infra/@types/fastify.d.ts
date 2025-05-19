import 'fastify'
import type { JWT } from '@fastify/jwt'

declare module 'fastify' {
  interface FastifyRequest {
    jwt: JWT
  }
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>
  }
  export interface FastifyRequest {
    getCurrentUserId(): Promise<string>
  }
}

type UserPayload = {
  sub: string
  role: 'INSTITUTION' | 'PROVIDER' | 'PATIENT'
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: UserPayload
  }
}
