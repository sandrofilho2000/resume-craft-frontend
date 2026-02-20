// src/api/http.ts

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type HttpRequestOptions<TBody = unknown> = {
  method?: HttpMethod;
  body?: TBody;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

export class HttpError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.data = data;
  }
}

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://127.0.0.1:3000';

function buildUrl(path: string) {
  if (!path.startsWith('/')) return `${BASE_URL}/${path}`;
  return `${BASE_URL}${path}`;
}

async function parseResponse(res: Response) {
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) return res.json();
  return res.text();
}

export async function http<TResponse, TBody = unknown>(
  path: string,
  options: HttpRequestOptions<TBody> = {},
): Promise<TResponse> {
  const { method = 'GET', body, headers, signal } = options;

  const res = await fetch(buildUrl(path), {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(headers ?? {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });
  
  const data = await parseResponse(res);

  if (!res.ok) {
    const message =
      typeof data === 'object' && data && 'message' in (data as any)
        ? String((data as any).message)
        : `Request failed with status ${res.status}`;

    throw new HttpError(message, res.status, data);
  }

  return data as TResponse;
}
