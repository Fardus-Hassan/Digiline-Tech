"use server";

import { updateTag } from "next/cache";
import { cookies } from "next/headers";

const API_URL = process.env.API_URL ?? "http://localhost:5000";
const AUTH_COOKIE = "digiline_token";

/** Called after the admin saves, so the website shows the change on the very next visit. */
export async function refreshSiteContent(tags: string[]) {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;  if (!token) throw new Error("Unauthorized");
  const res = await fetch(`${API_URL}/api/auth/me`, { headers: { cookie: `${AUTH_COOKIE}=${token}` } });
  if (!res.ok) throw new Error("Unauthorized");

  for (const tag of new Set(tags)) {
    if (tag === "sections" || /^entries:[a-zA-Z]+$/.test(tag)) updateTag(tag);
  }}
