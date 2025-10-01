import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { columnId, content, description } = req.body;

    if (!columnId || !content) {
      return res.status(400).json({ error: "columnId and content are required" });
    }

    // Determine position
    const cardCount = await prisma.card.count({ where: { columnId } });

    const card = await prisma.card.create({
      data: {
        content,
        description,
        columnId,
        position: cardCount,
      },
    });

    return res.status(201).json(card);
  } catch {
    return res.status(500).json({ error: "Failed to create card" });
  }
}
