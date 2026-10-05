import { z } from 'zod'

export const AskRequestSchema = z.object({
  prompt: z.string().trim().min(1).max(500),
})

export const AskResponseSchema = z.object({
  answer: z.string().min(1),
  source: z.enum(['gateway', 'canned']), // which path produced it; the app may show nothing
  model: z.string().min(1).optional(), // present when source is 'gateway'
})

/** @typedef {z.infer<typeof AskRequestSchema>} AskRequest */
/** @typedef {z.infer<typeof AskResponseSchema>} AskResponse */
