import { randomUUID } from "node:crypto";
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient, TABLE_NAME } from "./db.js";

let driver = "dynamodb";
const memoryTodos = [];

export function useMemoryStore() {
  driver = "memory";
}

export function getStoreDriver() {
  return driver;
}

export async function listTodos() {
  if (driver === "memory") {
    return [...memoryTodos].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  const result = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));
  return (result.Items || []).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

export async function createTodo(title) {
  const todo = {
    id: randomUUID(),
    title,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  if (driver === "memory") {
    memoryTodos.unshift(todo);
    return todo;
  }

  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: todo }));
  return todo;
}

export async function updateTodo(id, body) {
  const existing = await getTodo(id);
  if (!existing) return null;

  const title = typeof body?.title === "string" ? body.title.trim() : existing.title;
  if (!title) {
    const error = new Error("Title is required");
    error.status = 400;
    throw error;
  }

  const completed =
    typeof body?.completed === "boolean" ? body.completed : existing.completed;
  const updated = {
    ...existing,
    title,
    completed,
    updatedAt: new Date().toISOString(),
  };

  if (driver === "memory") {
    const index = memoryTodos.findIndex((item) => item.id === id);
    memoryTodos[index] = updated;
    return updated;
  }

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: "SET title = :title, completed = :completed, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":title": title,
        ":completed": completed,
        ":updatedAt": updated.updatedAt,
      },
      ReturnValues: "ALL_NEW",
    })
  );

  return result.Attributes;
}

export async function deleteTodo(id) {
  const existing = await getTodo(id);
  if (!existing) return false;

  if (driver === "memory") {
    const index = memoryTodos.findIndex((item) => item.id === id);
    memoryTodos.splice(index, 1);
    return true;
  }

  await docClient.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { id } }));
  return true;
}

async function getTodo(id) {
  if (driver === "memory") {
    return memoryTodos.find((item) => item.id === id) || null;
  }

  const existing = await docClient.send(
    new GetCommand({ TableName: TABLE_NAME, Key: { id } })
  );
  return existing.Item || null;
}
