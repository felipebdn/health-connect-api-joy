import z from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),

  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().optional().default(3333),
  HOST: z.string().optional().default('0.0.0.0'),

  JWT_SECRET_KEY: z.string(),

  RESEND_API_KEY: z.string(),

  BASE_URL_FRONT: z.string().url(),
})

export const env = envSchema.parse(process.env)
