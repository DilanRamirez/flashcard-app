// pages/api/decks.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const decksDir = path.join(process.cwd(), "public", "decks");
  let files: string[] = [];
  try {
    files = fs.readdirSync(decksDir).filter((f) => f.endsWith(".json"));
  } catch (e) {
    console.error("Could not read decks directory:", e);
    return res.status(500).json({ error: "Failed to read decks" });
  }
  // return array of URLs
  res.status(200).json(files.map((f) => `/decks/${f}`));
}
