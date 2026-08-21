import { useEffect, useMemo, useState } from "react";
import { createTodo, deleteTodo, getTodos, initApi, updateTodo } from "./api.js";

function remainingLabel(count) {
  if (count === 0) return "All caught up";
  if (count === 1) return "1 task left";
  return `${count} tasks left`;
}

export default function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadTodos() {
    setError("");
    try {
      const items = await getTodos();
      setTodos(items);
    } catch (err) {
      setError(err.message || "Could not load todos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    initApi().then(loadTodos);
  }, []);

  const remaining = useMemo(
    () => todos.filter((todo) => !todo.completed).length,
    [todos]
  );

  async function handleAdd(event) {
    event.preventDefault();
    const value = title.trim();
    if (!value || saving) return;

    setSaving(true);
    setError("");
    try {
      const created = await createTodo(value);
      setTodos((current) => [created, ...current]);
      setTitle("");
    } catch (err) {
      setError(err.message || "Could not add todo");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(todo) {
    const nextCompleted = !todo.completed;
    setTodos((current) =>
      current.map((item) =>
        item.id === todo.id ? { ...item, completed: nextCompleted } : item
      )
    );

    try {
      await updateTodo(todo.id, { completed: nextCompleted });
    } catch (err) {
      setTodos((current) =>
        current.map((item) => (item.id === todo.id ? todo : item))
      );
      setError(err.message || "Could not update todo");
    }
  }

  async function handleDelete(id) {
    const previous = todos;
    setTodos((current) => current.filter((item) => item.id !== id));

    try {
      await deleteTodo(id);
    } catch (err) {
      setTodos(previous);
      setError(err.message || "Could not delete todo");
    }
  }

  return (
    <main className="page">
      <section className="card">
        <header className="header">
          <p className="eyebrow">DynamoDB · Node · React</p>
          <h1>Today&apos;s list</h1>
          <p className="subtitle">{remainingLabel(remaining)}</p>
        </header>

        <form className="composer" onSubmit={handleAdd}>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Add a task"
            aria-label="New task"
            maxLength={200}
            autoComplete="off"
          />
          <button type="submit" disabled={saving || !title.trim()}>
            {saving ? "Adding…" : "Add"}
          </button>
        </form>

        {error ? <p className="banner">{error}</p> : null}

        {loading ? (
          <p className="muted">Loading tasks…</p>
        ) : todos.length === 0 ? (
          <p className="empty">Nothing here yet. Add your first task above.</p>
        ) : (
          <ul className="list">
            {todos.map((todo) => (
              <li key={todo.id} className={todo.completed ? "done" : ""}>
                <label>
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggle(todo)}
                  />
                  <span>{todo.title}</span>
                </label>
                <button
                  type="button"
                  className="ghost"
                  onClick={() => handleDelete(todo.id)}
                  aria-label={`Delete ${todo.title}`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
