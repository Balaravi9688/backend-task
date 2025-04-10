import { Request, Response } from "express";
import { pool } from "../utils/db";

export const getTasks: any = async (req: Request, res: Response) => {
  try {
    const filter = req.query.filter as string;

    let query = "SELECT * FROM tasks";
    const params: any[] = [];

    if (filter === "completed") {
      query += " WHERE status = $1";
      params.push("completed");
    } else if (filter === "pending") {
      query += " WHERE status = $1";
      params.push("pending");
    }

    const { rows } = await pool.query(query, params);
    res.json({ tasks: rows });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

export const createTask: any = async (req: Request, res: Response) => {
  try {
    const { title, description, status } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required." });
    }

    const taskStatus = status === "completed" ? "completed" : "pending";

    await pool.query(
      "INSERT INTO tasks (title, description, status) VALUES ($1, $2, $3)",
      [title, description, taskStatus]
    );

    res.status(201).json({ message: "Task created successfully" });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ message: "Failed to create task" });
  }
};
