import { Router } from "express";
import { createTodo, deleteTodo, listTodos, updateTodo } from "./store.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    res.json(await listTodos());
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    res.status(201).json(await createTodo(title));
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const updated = await updateTodo(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const deleted = await deleteTodo(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
