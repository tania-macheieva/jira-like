export const request = async (path, options = {}) => {
  const response = await fetch(`/api/v1${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  const body =
    response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(
      body?.error || body?.errors?.join(", ") || "Request failed",
    );
  return body;
};

export const jsonRequest = (path, method, payload) =>
  request(path, {
    method,
    body: JSON.stringify(payload),
  });
