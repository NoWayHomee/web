const API = "/api";

export async function api(path: string, opts: RequestInit = {}) {
  const response = await fetch(API + path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Loi may chu");
  return data;
}
