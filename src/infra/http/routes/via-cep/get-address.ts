import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

interface dataViaCepTypes {
  cep?: string
  logradouro?: string
  complemento?: string
  unidade?: string
  bairro?: string
  localidade?: string
  uf?: string
  estado?: string
  regiao?: string
  ibge?: string
  gia?: string
  ddd?: string
  siafi?: string
}

export async function GetAddressRouter(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/cep/:cep',
    {
      schema: {
        tags: ['Via CEP'],
        summary: 'Get address from CEP.',
        params: z.object({
          cep: z.string(),
        }),
        response: {
          200: z.object({
            cep: z.string().optional(),
            logradouro: z.string().optional(),
            complemento: z.string().optional(),
            unidade: z.string().optional(),
            bairro: z.string().optional(),
            localidade: z.string().optional(),
            uf: z.string().optional(),
            estado: z.string().optional(),
            regiao: z.string().optional(),
            ibge: z.string().optional(),
            gia: z.string().optional(),
            ddd: z.string().optional(),
            siafi: z.string().optional(),
          }),
          400: z.object({ status: z.literal(400), message: z.string() }),
        },
      },
    },
    async ({ params }, reply) => {
      try {
        const res = await fetch(
          `https://viacep.com.br/ws/${params.cep || '00000000'}/json/`,
          {
            method: 'GET',
          }
        )

        const data: dataViaCepTypes | undefined = await res.json()

        return reply.status(200).send(data)
      } catch (error) {
        return reply
          .status(400)
          .send({ message: 'Endereço não encontrado', status: 400 })
      }
    }
  )
}
