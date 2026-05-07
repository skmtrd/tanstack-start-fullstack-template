export type AuthMode = "signin" | "signup";

export type CurrentSession = {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    emailVerified: boolean;
  };
} | null;
