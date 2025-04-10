import { Request, Response } from "express";
import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";
import { pool } from "../utils/db";

export const importChat: any = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = path.resolve(req.file.path);
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data: any = XLSX.utils.sheet_to_json(sheet);

    const chats: [string, string][] = [];

    for (const row of data) {
      if (row.message && row.sender) {
        chats.push([row.message, row.sender]);
      }
    }

    if (chats.length === 0) {
      return res.status(400).json({ message: "No valid chat data found" });
    }

    const values = chats.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(", ");
    const flatValues = chats.flat();

    const insertQuery = `INSERT INTO chats (message, sender) VALUES ${values}`;
    await pool.query(insertQuery, flatValues);

    fs.unlinkSync(filePath);

    res.status(200).json({ message: "Chat imported successfully", imported: chats.length });
  } catch (error) {
    console.error("Chat import error:", error);
    res.status(500).json({ message: "Failed to import chat" });
  }
};
