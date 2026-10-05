import { z } from 'zod'

export const ApiErrorSchema = z.object({
  error: z.object({
    code: z.string().min(1), // machine-readable, e.g. "bad_request", "upstream"
    message: z.string().min(1), // human-readable, safe to show
  }),
})

/** @typedef {z.infer<typeof ApiErrorSchema>} ApiError */
