import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: "",
  plugins: [adminClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;

export async function getSession() {
  const { data } = await authClient.getSession();
  return data;
}
