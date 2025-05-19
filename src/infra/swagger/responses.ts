import { z } from 'zod'

export const response409 = z.object({
  status: z.number(z.literal(409)),
  message: z.string(),
  errors: z.array(
    z.object({
      field: z.string().optional(),
      code: z.string(),
      message: z.string(),
    })
  ),
})
