import { describe, expect, it } from 'vitest'
import { SoundCatalogSchema, SoundSchema } from '../src/index.js'

const sound = { id: 'goat-scream', name: 'Goat Scream', audioUrl: 'https://example.com/goat.mp3' }

describe('SoundSchema', () => {
  it('parses a valid fixture, with and without group', () => {
    expect(SoundSchema.safeParse(sound).success).toBe(true)
    expect(SoundSchema.safeParse({ ...sound, group: 'animals' }).success).toBe(true)
  })

  it.each(['id', 'name', 'audioUrl'])('fails when %s is missing and names it', (field) => {
    const { [field]: _, ...rest } = sound
    const result = SoundSchema.safeParse(rest)
    expect(result.success).toBe(false)
    expect(result.error.issues[0].path).toEqual([field])
  })

  it('rejects a non-slug id and a non-URL audioUrl', () => {
    expect(SoundSchema.safeParse({ ...sound, id: 'Goat Scream' }).success).toBe(false)
    expect(SoundSchema.safeParse({ ...sound, audioUrl: 'nope' }).success).toBe(false)
  })
})

describe('SoundCatalogSchema', () => {
  const catalog = { version: '2026-10-05', sounds: [sound] }

  it('parses a valid fixture', () => {
    expect(SoundCatalogSchema.safeParse(catalog).success).toBe(true)
  })

  it.each(['version', 'sounds'])('fails when %s is missing and names it', (field) => {
    const { [field]: _, ...rest } = catalog
    const result = SoundCatalogSchema.safeParse(rest)
    expect(result.success).toBe(false)
    expect(result.error.issues[0].path).toEqual([field])
  })

  it('rejects an empty sounds array', () => {
    expect(SoundCatalogSchema.safeParse({ ...catalog, sounds: [] }).success).toBe(false)
  })
})
