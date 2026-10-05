import { z } from 'zod'

export const SoundSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/), // slug, e.g. "goat-scream"
  name: z.string().min(1), // display name, e.g. "Goat Scream"
  audioUrl: z.string().url(), // absolute https URL to the mp3
  group: z.string().min(1).optional(), // optional grouping, unused today
})

export const SoundCatalogSchema = z.object({
  version: z.string().min(1), // catalog version the API reports, e.g. "2026-10-05"
  sounds: z.array(SoundSchema).min(1),
})

/** @typedef {z.infer<typeof SoundSchema>} Sound */
/** @typedef {z.infer<typeof SoundCatalogSchema>} SoundCatalog */
