export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export async function browserApiClient<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/backend${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new ApiClientError(message || `Request failed with ${response.status}`, response.status);
  }

  const text = await response.text();
  if (!text) {
    throw new ApiClientError(`Empty response from ${path}`, response.status);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiClientError(`Invalid JSON response from ${path}: ${text.slice(0, 180)}`, response.status);
  }
}
