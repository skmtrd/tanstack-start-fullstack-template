import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import { auth } from "#/lib/auth";

export const getCurrentSession = createServerFn({ method: "GET" }).handler(async () => {
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
      image: session.user.image,
      emailVerified: session.user.emailVerified,
    },
  };
});
