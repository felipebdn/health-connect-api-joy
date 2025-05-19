import type { FastifyReply, FastifyRequest } from 'fastify'

export const Authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const token = request.cookies['atlas.access_token']

  if (!token) {
    reply.status(401).send({ message: 'Unauthorized' })
  } else {
    try {
      const response = request.jwtVerify()
    } catch (err) {
      reply.status(401).send({ message: 'Unauthorized' })
    }
  }
}
