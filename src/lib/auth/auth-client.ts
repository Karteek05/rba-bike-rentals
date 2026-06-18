import { createAuthClient } from "better-auth/react";
import { getPublicAuthClientBaseUrl } from "@/lib/utils/app-url";

const baseURL = getPublicAuthClientBaseUrl();

export const authClient = createAuthClient(baseURL ? { baseURL } : {});
