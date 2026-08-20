const API = "/api/todos";

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
  return request(API);
}

export function createTodo(title) {
  return request(API, {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

export function updateTodo(id, updates) {
  return request(`${API}/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export function deleteTodo(id) {
  return request(`${API}/${id}`, { method: "DELETE" });
}
