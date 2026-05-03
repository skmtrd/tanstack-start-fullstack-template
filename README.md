# tss-cf

TanStack Start full-stack template for Cloudflare Workers.

This template uses:

- TanStack Start for the full-stack React app and server routes
- Cloudflare Workers as the deploy target
- Cloudflare D1 through Drizzle ORM
- Cloudflare R2 through Worker bindings
- Better Auth with the Drizzle adapter
- TanStack Query SSR integration

# Getting Started

Install dependencies and create local Worker env vars:

```bash
vp install
cp .dev.vars.example .dev.vars
```

Set `BETTER_AUTH_SECRET` in `.dev.vars` to a random value with at least 32 characters.

Generate Worker binding types and apply the local D1 migration:

```bash
pnpm run cf-typegen
pnpm run db:migrate
```

Run the app:

```bash
pnpm dev
```

The local health check is available at `http://localhost:3000/api/health`.

# Validation

Run the Vite+ checks, tests, and build:

```bash
vp check
vp test run
pnpm build
```

`vp test run` uses Vitest. The Cloudflare Vite plugin is disabled during test mode because Vitest's Node-oriented SSR defaults conflict with Cloudflare Worker environment validation.

## Cloudflare Resources

Create the remote resources once per Cloudflare account:

```bash
wrangler login
pnpm run d1:create
pnpm run r2:create
```

`wrangler.jsonc` binds them as:

- `env.DB` -> D1 database `tss-cf-db`
- `env.BUCKET` -> R2 bucket `tss-cf-uploads`

After changing `wrangler.jsonc` or `.dev.vars.example`, regenerate types:

```bash
pnpm run cf-typegen
```

## Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling.

### Removing Tailwind CSS

If you prefer not to use Tailwind CSS:

1. Remove the demo pages in `src/routes/demo/`
2. Replace the Tailwind import in `src/styles.css` with your own styles
3. Remove `tailwindcss()` from the plugins array in `vite.config.ts`
4. Uninstall the packages: `pnpm add @tailwindcss/vite tailwindcss --dev`

## Database Migrations

Drizzle generates SQL into `drizzle/`, and Wrangler applies those migrations to D1.

```bash
pnpm run db:generate
pnpm run db:migrate
pnpm run db:migrate:remote
```

Always inspect generated SQL before applying it remotely.

## Deploy to Cloudflare Workers

Set production auth config before deploying:

```bash
wrangler secret put BETTER_AUTH_SECRET
wrangler secret put BETTER_AUTH_URL
```

Then apply remote migrations and deploy:

```bash
pnpm run db:migrate:remote
pnpm run deploy:dry-run
pnpm run deploy
```

`BETTER_AUTH_URL` should be the deployed app URL, for example `https://tss-cf.<subdomain>.workers.dev` or your custom domain.

## Better Auth

Better Auth is configured in `src/lib/auth.ts` with the Drizzle adapter and D1-backed schema from `src/db/schema.ts`.

The auth handler is mounted at `src/routes/api/auth/$.ts`.

## Shadcn

Add components using the latest version of [Shadcn](https://ui.shadcn.com/).

```bash
pnpm dlx shadcn@latest add button
```

## Routing

This project uses [TanStack Router](https://tanstack.com/router) with file-based routing. Routes are managed as files in `src/routes`.

### Adding A Route

To add a new route to your application just add a new file in the `./src/routes` directory.

TanStack will automatically generate the content of the route file for you.

Now that you have two routes you can use a `Link` component to navigate between them.

### Adding Links

To use SPA (Single Page Application) navigation you will need to import the `Link` component from `@tanstack/react-router`.

```tsx
import { Link } from "@tanstack/react-router";
```

Then anywhere in your JSX you can use it like so:

```tsx
<Link to="/about">About</Link>
```

This will create a link that will navigate to the `/about` route.

More information on the `Link` component can be found in the [Link documentation](https://tanstack.com/router/v1/docs/framework/react/api/router/linkComponent).

### Using A Layout

In the File Based Routing setup the layout is located in `src/routes/__root.tsx`. Anything you add to the root route will appear in all the routes. The route content will appear in the JSX where you render `{children}` in the `shellComponent`.

Here is an example layout that includes a header:

```tsx
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "My App" },
    ],
  }),
  shellComponent: ({ children }) => (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <header>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
          </nav>
        </header>
        {children}
        <Scripts />
      </body>
    </html>
  ),
});
```

More information on layouts can be found in the [Layouts documentation](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#layouts).

## Server Functions

TanStack Start provides server functions that allow you to write server-side code that seamlessly integrates with your client components.

```tsx
import { createServerFn } from "@tanstack/react-start";

const getServerTime = createServerFn({
  method: "GET",
}).handler(async () => {
  return new Date().toISOString();
});

// Use in a component
function MyComponent() {
  const [time, setTime] = useState("");

  useEffect(() => {
    getServerTime().then(setTime);
  }, []);

  return <div>Server time: {time}</div>;
}
```

## API Routes

You can create API routes by using the `server` property in your route definitions:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";

export const Route = createFileRoute("/api/hello")({
  server: {
    handlers: {
      GET: () => json({ message: "Hello, World!" }),
    },
  },
});
```

## Data Fetching

There are multiple ways to fetch data in your application. You can use TanStack Query to fetch data from a server. But you can also use the `loader` functionality built into TanStack Router to load the data for a route before it's rendered.

For example:

```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/people")({
  loader: async () => {
    const response = await fetch("https://swapi.dev/api/people");
    return response.json();
  },
  component: PeopleComponent,
});

function PeopleComponent() {
  const data = Route.useLoaderData();
  return (
    <ul>
      {data.results.map((person) => (
        <li key={person.name}>{person.name}</li>
      ))}
    </ul>
  );
}
```

Loaders simplify your data fetching logic dramatically. Check out more information in the [Loader documentation](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#loader-parameters).

# Demo files

Files prefixed with `demo` can be safely deleted. They are there to provide a starting point for you to play around with the features you've installed.

# Learn More

You can learn more about all of the offerings from TanStack in the [TanStack documentation](https://tanstack.com).

For TanStack Start specific documentation, visit [TanStack Start](https://tanstack.com/start).
