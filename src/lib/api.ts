export async function apiFetch<T>(token: string | null | undefined, path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })
  if (!response.ok) throw new Error((await response.text()) || `Request failed (${response.status})`)
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}
