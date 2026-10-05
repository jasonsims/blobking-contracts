# blobking-contracts — implementation plan

The shared contract between the Blob King web app (`blobking.com`) and its API (`blobking-api`):
Zod schemas for every request and response the two exchange. Both sides depend on this package.
The API validates its responses against it on the way out; the app parses responses with it on the
way in. That symmetry is the whole point, and it is what the triage demo leans on: a PR in the API
that breaks the contract is caught by reading this package, not by guessing.

This repo is **public**. It holds schemas and nothing else, and a public repo is what lets Vercel
install it as a plain `github:` dependency with no token.

## Where it sits (the repo map)

| Repo | Role | Relationship |
| --- | --- | --- |
| `blobking.com` | Web app (Vue 3 + Vite, Vercel, Pendo installed) | depends on `blobking-api` (calls `/api/sounds`, `/api/ask`) and on this package (parses responses) |
| `blobking-api` | API (Vercel Functions) | depends on this package (validates its own responses) |
| `blobking-contracts` | Shared library | this repo |

## Decisions

- **Plain ESM JavaScript with JSDoc types, no build step.** Both consumers are JavaScript. A
  `github:` dependency installs straight from the repo, so there must be nothing to compile.
- **Zod 4.** The only runtime dependency. Pin a major, not a minor.
- **Consumed by git tag.** `"blobking-contracts": "github:jasonsims/blobking-contracts#v0.1.0"`.
  Every change that alters a schema bumps the version in `package.json`, tags, and is noted in
  `CHANGELOG.md`. Consumers bump the tag deliberately.
- **Node 24**, same as the app (`.nvmrc` = `24`, `engines.node >= 24`).
- **Tests with Vitest.** One spec per schema: a valid fixture parses, each required field missing
  fails, and the error names the field.

## Layout

```
blobking-contracts/
  package.json          name blobking-contracts, type module, exports map, version 0.1.0
  .nvmrc                24
  src/index.js          re-exports everything below
  src/sounds.js         SoundSchema, SoundCatalogSchema
  src/ask.js            AskRequestSchema, AskResponseSchema
  src/error.js          ApiErrorSchema
  src/index.d.ts        (optional) hand-written types if a consumer wants them; JSDoc is enough
  test/*.spec.js
  README.md             what this is, how to consume, how to release
  CHANGELOG.md
```

`package.json` `exports`: `"."` → `./src/index.js`. No `main` pointing at a dist directory.

## The schemas (v0.1.0)

Field names are the contract. The demo's planted bug renames one of them in the API, so do not
"improve" these names later without a version bump and both consumers updated.

```js
// src/sounds.js
export const SoundSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),        // slug, e.g. "goat-scream"
  name: z.string().min(1),                      // display name, e.g. "Goat Scream"
  audioUrl: z.string().url(),                   // absolute https URL to the mp3
  group: z.string().min(1).optional(),          // optional grouping, unused today
})
export const SoundCatalogSchema = z.object({
  version: z.string().min(1),                   // catalog version the API reports, e.g. "2026-10-05"
  sounds: z.array(SoundSchema).min(1),
})
```

```js
// src/ask.js
export const AskRequestSchema = z.object({
  prompt: z.string().trim().min(1).max(500),
})
export const AskResponseSchema = z.object({
  answer: z.string().min(1),
  source: z.enum(['gateway', 'canned']),        // which path produced it; the app may show nothing
  model: z.string().min(1).optional(),          // present when source is 'gateway'
})
```

```js
// src/error.js
export const ApiErrorSchema = z.object({
  error: z.object({
    code: z.string().min(1),                    // machine-readable, e.g. "bad_request", "upstream"
    message: z.string().min(1),                 // human-readable, safe to show
  }),
})
```

Export the inferred JSDoc typedefs beside each schema (`/** @typedef {z.infer<typeof SoundSchema>} Sound */`).

## How consumers use it

- **API (`blobking-api`)** builds the catalog, then `SoundCatalogSchema.parse(catalog)` before
  serializing. A parse failure is a 500 with an `ApiError` body, never a malformed 200.
- **App (`blobking.com`)** calls `SoundCatalogSchema.safeParse(json)`. On failure it logs the issues
  and renders what it got. That leniency is deliberate for the demo (buttons render with no
  `audioUrl` and clicks play nothing), and it is documented in the app's plan, not here.

## Order of work

1. `npm init`, add `zod`, `vitest`, set `type: module`, `exports`, `engines`, `.nvmrc`.
2. Write the three schema files and `index.js`.
3. Tests: valid fixtures parse; each required field missing fails with the field named.
4. README with the consume snippet and the release steps (bump, tag `vX.Y.Z`, push tags).
5. Tag `v0.1.0` and push the tag. Consumers pin to it.

## Done when

- `npm test` passes.
- `node -e "import('blobking-contracts').then(m => console.log(Object.keys(m)))"` from a scratch
  project that depends on `github:jasonsims/blobking-contracts#v0.1.0` lists the six exports.
- `v0.1.0` tag exists on GitHub.

## Do not

- Add a build step, TypeScript compilation, or a `dist/` directory.
- Add anything that is not a schema shared by both sides (no HTTP helpers, no constants for URLs).
- Change a field name without a version bump.
