import { describe, expect, it } from 'vitest'
import { AskRequestSchema, AskResponseSchema } from '../src/index.js'

describe('AskRequestSchema', () => {
  it('parses a valid fixture and trims', () => {
    expect(AskRequestSchema.parse({ prompt: '  hi  ' }).prompt).toBe('hi')
  })

  it('fails when prompt is missing and names it', () => {
    const result = AskRequestSchema.safeParse({})
    expect(result.success).toBe(false)
    expect(result.error.issues[0].path).toEqual(['prompt'])
  })

  it('rejects blank and over-long prompts', () => {
    expect(AskRequestSchema.safeParse({ prompt: '   ' }).success).toBe(false)
    expect(AskRequestSchema.safeParse({ prompt: 'a'.repeat(501) }).success).toBe(false)
  })
})

describe('AskResponseSchema', () => {
  const response = { answer: 'Blob.', source: 'gateway', model: 'some-model' }

  it('parses valid fixtures', () => {
    expect(AskResponseSchema.safeParse(response).success).toBe(true)
    expect(AskResponseSchema.safeParse({ answer: 'Blob.', source: 'canned' }).success).toBe(true)
  })

  it.each(['answer', 'source'])('fails when %s is missing and names it', (field) => {
    const { [field]: _, ...rest } = response
    const result = AskResponseSchema.safeParse(rest)
    expect(result.success).toBe(false)
    expect(result.error.issues[0].path).toEqual([field])
  })

  it('rejects an unknown source', () => {
    expect(AskResponseSchema.safeParse({ ...response, source: 'other' }).success).toBe(false)
  })
})
