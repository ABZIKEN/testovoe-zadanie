# Abzal Alanov · Digital Business Card API

Read-only backend assignment using Git, TypeScript, Node.js, NestJS, Prisma, GraphQL and Docker.
Apollo Sandbox runs at `/graphql`, including in production. The root URL redirects to Sandbox.

## Run from a fresh clone

```bash
git clone https://github.com/ABZIKEN/testovoe-zadanie.git
cd testovoe-zadanie
docker compose up --build
```

Open http://localhost:3000/graphql and press the Run button. No account, external database or environment file is required for Docker.
The container runs committed migrations and the seed before listening. Subsequent starts update the same profile without duplicate rows.

Without Docker, install Node.js 22, then:

```bash
npm ci
cp .env.example .env
npm run build
npm start
```

PowerShell: use `Copy-Item .env.example .env` instead of `cp`.
`DATABASE_URL` is a Prisma SQLite URL. Relative paths resolve against `prisma/`; the default example creates `prisma/card.db`.

## Example query

```graphql
query BusinessCard {
  profile {
    name
    description
    links { label url }
    skills { name }
    experience {
      company
      position
      startDate
      endDate
      achievements
    }
    projects { name url }
  }
}
```

Minimal input: `{ profile { name } }`

Expected output:

```json
{"data":{"profile":{"name":"Abzal Alanov"}}}
```

Dates use `YYYY-MM`; `endDate: null` represents an ongoing position. Lists use explicit, deterministic ordering.
Only queries exist. There is no public write API. `GET /health` returns HTTP 200 only when the database and seeded owner profile are available.

## Responsibilities

- `src/profile/profile.resolver.ts`: GraphQL entry point, delegating to the service.
- `src/profile/profile.model.ts`: code-first public schema, separate from persistence models.
- `src/profile/profile.service.ts`: owner-profile availability and presentation of achievements.
- `src/profile/profile.repository.ts`: Prisma access and ordered relation loading.
- `src/database/`: connection lifecycle and dependency injection.
- `prisma/schema.prisma`, `prisma/migrations/`: relational schema, foreign keys, indexes and versioned migrations.
- `prisma/profile.data.ts`, `prisma/seed.ts`: reviewed content and transactional, repeatable initialization.

The root query returns one bounded profile aggregate. Prisma loads relations in batches, with a fixed number of relation queries rather than one query per experience row. GraphQL resolves nested fields from the loaded aggregate, supporting aliases and fragments without resolver-level database calls.
This intentionally loads a few small lists even for a name-only query. For a multi-profile product, introduce pagination and request-scoped relation loaders after measuring query needs.

SQLite avoids external setup for a small read-only portfolio. Docker stores the database in a named volume. This deployment is intended for one container replica. A shared, writable or multi-replica application should use an external database and a separate migration job.

The seed replaces only the owner's related rows inside a transaction. Stable IDs and explicit ordering keep repeated results consistent. Other profiles remain untouched. Manual edits to this owner's data are overwritten at the next seed; edit the source data instead.

## Your information

Update `prisma/profile.data.ts`, rebuild, and restart. Links come from the task. Experience and skills come from the owner's existing published resume:
https://github.com/ABZIKEN/resume/blob/309e1ba33e7392a79b6d7b400bfed30f78f0c135/index.html

Employment is self-reported, not independently verified. No additional employers, credentials or numerical achievements were invented. Project links point to existing repositories in the owner's account. The original resume website is not part of this project.

## Validation

```bash
npm test
npm run vercel-build
node scripts/test-vercel.cjs
```

Integration tests create a temporary database, apply real migrations, seed it and start the actual NestJS HTTP server. They cover nested data, aliases/fragments, repeatable initialization, unrelated-data preservation, Sandbox, introspection, validation errors and health failures.
GitHub Actions additionally builds and starts Docker Compose, waits for health, and executes a real GraphQL request against the container.

## Vercel

The project includes `vercel.json` and a serverless adapter. Connect this repository to Vercel with the root directory `.` and Node.js 22. Create a new Vercel project named digital-business-card. No database credentials are required.

The build runs migrations and seed into a SQLite snapshot. Each cold start copies the snapshot into an isolated temporary directory before starting NestJS. One initialization promise handles simultaneous first requests. The original Express request path reaches NestJS through rewrites.

This snapshot approach is only for the read-only assignment. Temporary serverless storage is not durable, and copies are not shared. Content changes require redeployment. Docker uses persistent storage and runs migrations plus seed on each start.

After deployment, open the deployment URL with `/graphql`. If Vercel deployment protection requires sign-in, allow public review in the project's settings before submitting the link.

Official deployment references:
- https://vercel.com/docs/frameworks/backend/nestjs
- https://docs.nestjs.com/graphql/quick-start

Apollo Sandbox loads its interface from Apollo's CDN, so the browser needs internet access. Direct GraphQL requests work independently of the Sandbox interface.
