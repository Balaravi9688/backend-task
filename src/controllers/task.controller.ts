import { Request, Response } from "express";
import { pool } from "../utils/db";
import { TaskBody } from "../constant/task.auth";

export const getTasks: any = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const filter = req.query.filter as string;

    let query = "SELECT * FROM tasks";
    const params: string[] = [];

    if (filter === "completed" || filter === "pending") {
      query += " WHERE status = $1";
      params.push(filter);
    }

    const { rows } = await pool.query(query, params);
    return res.status(200).json({ tasks: rows });
  } catch (error) {
    console.error("Get tasks error:", error);
    return res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

export const createTask: any = async (
  req: Request<{}, {}, TaskBody>,
  res: Response
): Promise<Response> => {
  try {
    const { title, description = "", status } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required." });
    }

    const taskStatus: "pending" | "completed" =
      status === "completed" ? "completed" : "pending";

    await pool.query(
      "INSERT INTO tasks (title, description, status) VALUES ($1, $2, $3)",
      [title, description, taskStatus]
    );

    return res.status(201).json({ message: "Task created successfully" });
  } catch (error) {
    console.error("Create task error:", error);
    return res.status(500).json({ message: "Failed to create task" });
  }
};
