# blobking-contracts

Shared Zod schemas for every request and response exchanged between the Blob King app
(`blobking.com`) and its API (`blobking-api`). The API validates responses against these on the
way out; the app parses them on the way in. Plain ESM JavaScript with JSDoc types, no build step.

## Consume

```json
"blobking-contracts": "github:jasonsims/blobking-contracts#v0.1.0"
```

```js
import { SoundCatalogSchema } from 'blobking-contracts'

const result = SoundCatalogSchema.safeParse(json)
```

Exports: `SoundSchema`, `SoundCatalogSchema`, `AskRequestSchema`, `AskResponseSchema`, `ApiErrorSchema`.

## Develop

```sh
npm install
npm test
```

Field names are the contract. Changing one requires a version bump and both consumers updated.

## Release

1. Bump `version` in `package.json` and add a `CHANGELOG.md` entry.
2. Commit, then `git tag vX.Y.Z`.
3. `git push && git push --tags`.
4. Consumers bump their pinned tag deliberately.
