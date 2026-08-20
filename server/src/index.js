import "dotenv/config";
import express from "express";
import cors from "cors";
import { getTableName } from "./db.js";
import { ensureTable } from "./ensureTable.js";
import { loadSecrets } from "./loadSecrets.js";
import { getStoreDriver, useMemoryStore } from "./store.js";
import todosRouter from "./todos.js";

async function start() {
  await loadSecrets();

  const app = express();
  const port = Number(process.env.PORT) || 4000;
  const tableName = getTableName();

  // S3 website + local Vite. CORS_ORIGIN comes from Secrets Manager on EC2.
  const allowedOrigins = (
    process.env.CORS_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173"
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(cors({ origin: allowedOrigins }));
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, table: tableName, store: getStoreDriver() });
  });

  app.use("/api/todos", todosRouter);

  app.use((err, _req, res, _next) => {
    console.error(err);
    const status = err.status || 500;
    const message =
      err.name === "ResourceNotFoundException"
        ? `DynamoDB table "${tableName}" was not found`
        : err.message || "Internal server error";
    res.status(status).json({ error: message });
  });

  try {
    await ensureTable();
    console.log(`Using AWS DynamoDB table: ${tableName}`);
  } catch (err) {
    useMemoryStore();
    console.warn("AWS DynamoDB is not configured yet. Using in-memory todos for now.");
    console.warn(err.message);
  }

  app.listen(port, "0.0.0.0", () => {
    console.log(`API listening on http://0.0.0.0:${port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
