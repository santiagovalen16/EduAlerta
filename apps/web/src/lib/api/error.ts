export async function readApiError(response: Response) {
  const text = await response.text();
  if (!text) return `Solicitud fallida (${response.status})`;

  try {
    const payload = JSON.parse(text) as { message?: string | string[]; error?: string };
    if (Array.isArray(payload.message)) return payload.message.join(", ");
    return payload.message ?? payload.error ?? text;
  } catch {
    return text;
  }
}
