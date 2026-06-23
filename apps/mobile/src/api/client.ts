import { env } from "../config/env";

type RequestOptions = {
  body?: unknown;
  method?: "GET" | "POST" | "PATCH";
  token?: string | null;
};

const requestTimeoutMs = 10000;

export async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const headers: Record<string, string> = {
    Accept: "application/json"
  };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  let response: Response;

  try {
    response = await fetch(`${env.apiUrl}${path}`, {
      method: options.method ?? "GET",
      headers,
      signal: controller.signal,
      body: options.body ? JSON.stringify(options.body) : undefined
    });
  } catch (error) {
    const isTimeout =
      error instanceof Error &&
      (error.name === "AbortError" || error.message.includes("aborted"));

    throw new Error(
      isTimeout
        ? `API timed out. Check EXPO_PUBLIC_API_URL: ${env.apiUrl}`
        : `Cannot reach API at ${env.apiUrl}`
    );
  } finally {
    clearTimeout(timeout);
  }

  const data =
    response.status === 204
      ? undefined
      : ((await response.json()) as T | { error?: string });

  if (!response.ok) {
    const maybeError = data as { error?: string };
    throw new Error(maybeError.error ?? "API request failed");
  }

  return data as T;
}
