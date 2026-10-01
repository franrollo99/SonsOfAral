const API_URL = import.meta.env.VITE_API_URL;

export function getAuthToken() {
  return localStorage.getItem("token");
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("rol");
}

export async function apiJson(path, options = {}) {
  const token = options.token ?? getAuthToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data?.message || (data?.errors ? Object.values(data.errors).flat().join(" ") : "Error de comunicación.")
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
