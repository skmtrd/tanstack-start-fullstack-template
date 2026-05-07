<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.

<!--VITE PLUS END-->

# Project Architecture Contract

This repository is a TanStack Start full-stack template for Cloudflare Workers. Keep the stack cohesive: TanStack Start owns the React app and server runtime, Cloudflare owns deploy/runtime/data/storage, Drizzle owns schema/migrations, and Better Auth owns authentication.

Do not add a parallel backend framework or service unless the user explicitly asks for a deliberate architecture change. In particular, avoid introducing Express, Hono, Next.js API routes, a separate Node server, Docker-only local dependencies, or a non-TypeScript backend for normal app features.

## Stack Boundaries

- Use TanStack Start server functions and server routes for backend behavior.
- Use Cloudflare bindings for platform resources: `env.DB` for D1 and `env.BUCKET` for R2.
- Use Drizzle for database schema and queries.
- Use Better Auth for auth endpoints, sessions, and email/password flows.
- Local development should keep local state local. D1 and R2 local state are managed by Wrangler, not Docker.

## Feature Layout

Feature modules should follow this shape:

```txt
src/features/<feature>/
  components/   React UI for the feature
  client/       browser-only clients, fetch wrappers, client helpers
  server/       server functions, repositories, policies, server-only helpers
  shared/       types, schemas, constants safe for both client and server
```

Current examples:

```txt
src/features/auth/
src/features/todos/
src/features/uploads/
```

Keep files close to the feature unless they are genuinely cross-feature infrastructure. Shared infrastructure belongs in `src/lib` only when it is not owned by a specific domain.

## Server And Client Rules

- Files in `features/*/client` must not import `cloudflare:workers`, `db`, Better Auth server config, or server-only helpers.
- Files in `features/*/server` may import Cloudflare bindings, Drizzle, Better Auth server APIs, and other server-only helpers.
- Files in `features/*/shared` must stay serializable and safe to import from either client or server.
- Use `*.functions.ts` for TanStack `createServerFn` wrappers.
- Use `*.server.ts` for server-only helpers, repositories, policies, serializers, and platform integrations.
- Route-colocated helper files under `src/routes` should use the `-*.server.ts` pattern so TanStack Router does not treat them as routes.

## Server Functions vs API Routes

Use `createServerFn` for app-internal operations called from route components, loaders, or React Query mutations. Examples: list todos, create todos, get current session.

Use `src/routes/api/**` for explicit HTTP endpoints where the HTTP contract matters. Examples: file upload/download, webhooks, mobile/public API endpoints, custom status codes, response headers, binary bodies, or multipart form data.

Better Auth is a special case: keep `/api/auth/$` as a thin route that delegates to `auth.handler(request)`.

## Auth Contract

- Better Auth implementation lives in `src/features/auth/server/auth.server.ts`.
- `src/lib/auth.ts` remains a compatibility re-export for tools and conventions that expect an auth entrypoint under `src/lib`.
- Better Auth client setup lives in `src/features/auth/client/auth-client.ts`.
- `src/lib/auth-client.ts` remains a compatibility re-export.
- Route protection should use server-side session checks where possible, then client session state for UI display.
- Do not hand-roll password/session logic outside Better Auth.

## Database Contract

- Schema lives in `src/db/schema.ts`.
- Migrations live in `drizzle/`.
- Generate migrations with Drizzle and apply them through Wrangler D1 migration commands.
- Always scope user-owned rows by `userId` in server queries and mutations.
- Add indexes for new access patterns before they become performance assumptions.
- Do not edit remote data directly as a substitute for migrations.

## Upload And R2 Contract

Uploads should keep domain APIs separate and storage mechanics shared.

- Domain endpoints stay explicit, for example `POST /api/todos/$todoId/image`.
- Shared upload mechanics live in `src/features/uploads`.
- Do not let the client choose arbitrary bucket names, object prefixes, or R2 keys.
- Object keys must be generated on the server.
- Domain code is responsible for ownership checks and database updates.
- Upload helpers are responsible for image validation, object key generation, R2 put/get/delete, and safe cleanup.
- When replacing an image, delete the previous R2 object after the database update succeeds.
- When a database update fails after uploading, delete the newly uploaded object.

## Route Organization

Use file routes for UI pages under `src/routes`.

Use API routes under `src/routes/api` for HTTP endpoints. Keep route files thin. If a route needs meaningful server logic, colocate it next to the route as `-*.server.ts`.

Do not manually restructure `src/routeTree.gen.ts` as source of truth. It is generated from routes.

## Validation And Error Handling

- Validate all user input at the server boundary.
- Prefer Zod for structured server function input.
- For API routes, return explicit HTTP status codes and JSON error messages.
- Keep secrets and Cloudflare bindings server-side only.
- Avoid logging secrets, tokens, cookies, or full auth headers.

## Testing And Verification

Before considering a change complete, prefer:

```bash
vp check
vp test run
pnpm run deploy:dry-run
```

For changes touching auth, D1, R2, or API routes, add or run a small local smoke test through the HTTP boundary when practical.

For uploads, verify at least:

- upload succeeds
- download returns the expected content
- delete succeeds
- download after delete returns `404`

## Deployment Contract

- Deploy target is Cloudflare Workers.
- D1 and R2 are configured as Cloudflare bindings, not as URL-style database/storage environment variables.
- Secrets belong in Cloudflare secret storage or local `.dev.vars`, not in source-controlled config.
- Keep `wrangler.jsonc`, D1 migrations, and generated Cloudflare types aligned when bindings change.

## Template Design Goals

This project is meant to be copied. Favor boring, explicit patterns over clever abstractions.

Good template code should make these questions easy to answer:

- Is this client code or server code?
- Is this app-internal RPC or an external HTTP API?
- Where does auth happen?
- Where does ownership checking happen?
- Where are D1 writes performed?
- Where are R2 objects created and deleted?
- What needs to change when adding a new feature?

When a new pattern is introduced, update this file or a focused architecture doc so future work keeps the same shape.
