let apiBase = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

/**
 * S3 static hosting cannot run Express. /config.json supplies the EC2 API URL
 * so POST /api/todos does not hit the bucket (which returns 405).
 */
export async function initApi() {
  try {
    const response = await fetch("/config.json", { cache: "no-store" });
    if (!response.ok) return;
    const config = await response.json();
    const url = typeof config.apiUrl === "string" ? config.apiUrl.trim() : "";
    if (url && !url.includes("PUT_YOUR_EC2_PUBLIC_IP")) {
      apiBase = url.replace(/\/$/, "").replace(/\/api\/todos$/i, "");
    }
  } catch {
    // Local Vite proxy: leave apiBase empty so requests go to /api
  }
}

function todosUrl(path = "") {
  return `${apiBase}/api/todos${path}`;
}

async function request(url, options) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

export function getTodos() {
  return request(todosUrl());
}

export function createTodo(title) {
  return request(todosUrl(), {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

export function updateTodo(id, updates) {
  return request(todosUrl(`/${id}`), {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export function deleteTodo(id) {
  return request(todosUrl(`/${id}`), { method: "DELETE" });
}
