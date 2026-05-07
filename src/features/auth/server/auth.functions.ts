import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import type { CurrentSession } from "#/features/auth/shared/auth.types";
import { auth } from "#/features/auth/server/auth.server";

export const getCurrentSession = createServerFn({ method: "GET" }).handler(
  async (): Promise<CurrentSession> => {
    const session = await auth.api.getSession({
      headers: getRequest().headers,
      asResponse: false,
    });

    if (!session) {
      return null;
    }

    return {
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? null,
        emailVerified: session.user.emailVerified,
      },
    };
  },
);
