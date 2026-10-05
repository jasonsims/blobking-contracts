import { describe, expect, it } from 'vitest'
import { ApiErrorSchema } from '../src/index.js'

const body = { error: { code: 'bad_request', message: 'Nope' } }

describe('ApiErrorSchema', () => {
  it('parses a valid fixture', () => {
    expect(ApiErrorSchema.safeParse(body).success).toBe(true)
  })

  it('fails when error is missing and names it', () => {
    const result = ApiErrorSchema.safeParse({})
    expect(result.success).toBe(false)
    expect(result.error.issues[0].path).toEqual(['error'])
  })

  it.each(['code', 'message'])('fails when error.%s is missing and names it', (field) => {
    const { [field]: _, ...rest } = body.error
    const result = ApiErrorSchema.safeParse({ error: rest })
    expect(result.success).toBe(false)
    expect(result.error.issues[0].path).toEqual(['error', field])
  })
})
