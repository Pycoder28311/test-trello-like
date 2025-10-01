import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { cardId, text } = req.body;

    if (!cardId || !text) {
      return res.status(400).json({ error: "cardId and text are required" });
    }

    // Determine position
    const count = await prisma.checklistItem.count({ where: { cardId } });

    const item = await prisma.checklistItem.create({
      data: {
        cardId,
        text,
        completed: false,
        position: count,
      },
    });

    return res.status(201).json(item);
  } catch {
    return res.status(500).json({ error: "Failed to create checklist item" });
  }
}
