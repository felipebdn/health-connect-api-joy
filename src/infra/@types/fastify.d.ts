import 'fastify'
import type { JWT } from '@fastify/jwt'

declare module 'fastify' {
  interface FastifyRequest {
    jwt: JWT
  }
  export interface FastifyRequest {
    getCurrentUserId(): Promise<string>
  }
}

type UserPayload = {
  sub: string
  rule: 'INSTITUTION' | 'PROVIDER' | 'PATIENT'
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: UserPayload
  }
}
