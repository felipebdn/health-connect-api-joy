import z from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().optional().default(3333),
  HOST: z.string().optional().default('0.0.0.0'),

  JWT_SECRET_KEY: z.string(),

  PUBLIC_KEY_EMAILJS: z.string(),
  PRIVATE_KEY_EMAILJS: z.string(),

  EMAILJS_SERVICE_ID: z.string(),

  EMAILJS_TEMPLATE_ID_PROVIDER: z.string(),
  EMAILJS_TEMPLATE_ID_PATIENT: z.string(),

  BASE_URL_EMAILJS: z.string().url(),
  BASE_URL_FRONT: z.string().url(),
})

export const env = envSchema.parse(process.env)
