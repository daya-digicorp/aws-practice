import "dotenv/config";
import express from "express";
import cors from "cors";
import { TABLE_NAME } from "./db.js";
import { ensureTable } from "./ensureTable.js";
import { getStoreDriver, useMemoryStore } from "./store.js";
import todosRouter from "./todos.js";

const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"] }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, table: TABLE_NAME, store: getStoreDriver() });
});

app.use("/api/todos", todosRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  const message =
    err.name === "ResourceNotFoundException"
      ? `DynamoDB table "${TABLE_NAME}" was not found`
      : err.message || "Internal server error";
  res.status(status).json({ error: message });
});

async function start() {
  try {
    await ensureTable();
    console.log(`Using AWS DynamoDB table: ${TABLE_NAME}`);
  } catch (err) {
    useMemoryStore();
    console.warn("AWS DynamoDB is not configured yet. Using in-memory todos for now.");
    console.warn(err.message);
  }

  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
}

start();
