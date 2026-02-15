const BASE_URL = import.meta.env.VITE_NOROFF_API_BASE_URL as string;
const API_KEY = import.meta.env.VITE_NOROFF_API_KEY as string;

type ApiOptions = {
  method?: string;
  token?: string;
  body?: unknown;
};

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", token, body } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "X-Noroff-API-Key": API_KEY,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.errors?.[0]?.message || data?.message || "API request failed";
    throw new Error(message);
  }

  return data as T;
}
