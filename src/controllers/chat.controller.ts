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

    const fileExtension = path.extname(req.file.originalname);
    if (fileExtension !== ".xls") {
      return res
        .status(400)
        .json({ message: "Invalid file type. Please upload an Excel file." });
    }

    const filePath = path.resolve(req.file.path);
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data: ChatRow[] = XLSX.utils.sheet_to_json<ChatRow>(sheet);

    if (data.length === 0) {
      fs.unlinkSync(filePath);
      return res
        .status(400)
        .json({ message: "No data found in the uploaded file" });
    }

    const chats: [string, string][] = data
      .map((row) => {
        if (typeof row.message !== "string" || typeof row.sender !== "string") {
          return null;
        }
        return [row.message, row.sender];
      })
      .filter((chat) => chat !== null) as [string, string][];

    if (chats.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: "No valid chat data found" });
    }

    const valuePlaceholders = chats.map(() => `(?, ?)`).join(", ");
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
