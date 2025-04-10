import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../utils/db";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export const register: any = async (req: Request, res: Response) => {
  try {
    const { body } = req;

    if (!body?.name || !body?.email || !body?.password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUserQuery = await pool.query("SELECT * FROM users WHERE email = $1", [body?.email]);
    if (existingUserQuery.rows.length > 0) {
      return res.status(409).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(body?.password, 10);

    await pool.query(
      "INSERT INTO users (name, email, password, created_at) VALUES ($1, $2, $3, NOW())",
      [body?.name, body?.email, hashedPassword]
    );

    return res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

export const login: any = async (req: Request, res: Response) => {
  try {
    const { body } = req;

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [body?.email]);
    const user = result.rows[0];

    if (!user) return res.status(404).json({ message: "User not found." });

    const isMatch = await bcrypt.compare(body?.password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials." });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.json({ message: "Login successful.", token });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};
