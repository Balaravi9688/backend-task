import { Request, Response } from "express";
import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";
import { pool } from "../utils/db";
import { ChatRow } from "../constant/chat.types";

export const importChat: any = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = path.resolve(req.file.path);
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data: ChatRow[] = XLSX.utils.sheet_to_json<ChatRow>(sheet);

    const chats: [string, string][] = data
      .filter((row) => row.message && row.sender)
      .map((row) => [row.message, row.sender]);

    if (chats.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: "No valid chat data found" });
    }

    const valuePlaceholders = chats
      .map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`)
      .join(", ");
    const flatValues = chats.flat();

    const insertQuery = `INSERT INTO chats (message, sender) VALUES ${valuePlaceholders}`;
    await pool.query(insertQuery, flatValues);

    fs.unlinkSync(filePath);

    return res.status(200).json({
      message: "Chat imported successfully",
      imported: chats.length,
    });
  } catch (error) {
    console.error("Chat import error:", error);
    return res.status(500).json({ message: "Failed to import chat" });
  }
};
