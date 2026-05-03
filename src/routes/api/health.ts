import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        const d1 = await env.DB.prepare("SELECT 1 AS ok").first<{ ok: number }>();
        await env.BUCKET.head("__healthcheck__");

        return Response.json({
          status: "ok",
          d1: d1?.ok === 1,
          r2: true,
        });
      },
    },
  },
});
