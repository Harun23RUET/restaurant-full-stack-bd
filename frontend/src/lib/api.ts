import { getToken } from "./auth";

const API_BASE = "http://localhost:4000/api";

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.headers) {
    new Headers(options.headers).forEach((value, key) => {
      headers[key] = value;
    });
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  const text = await res.text();

  if (!res.ok) {
    let message = `API error: ${res.status}`;

    try {
      const data = JSON.parse(text);
      message = data?.message || message;
    } catch {}

    throw new Error(message);
  }

  if (!text) {
    return {} as T;
  }

  return JSON.parse(text) as T;
}

export async function apiGet<T>(
  path: string,
): Promise<T> {
  return apiRequest<T>(path, {
    method: "GET",
  });
}

export async function apiPost<T>(
  path: string,
  body: unknown,
): Promise<T> {
  return apiRequest<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function apiPatch<T>(
  path: string,
  body: unknown,
): Promise<T> {
  return apiRequest<T>(path, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function apiDelete<T>(
  path: string,
): Promise<T> {
  return apiRequest<T>(path, {
    method: "DELETE",
  });
}

export async function apiPut<T>(
  path: string,
  body: unknown,
): Promise<T> {
  return apiRequest<T>(path, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}
