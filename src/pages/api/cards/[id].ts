import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid card ID" });
  }

  try {
    if (req.method === "PUT") {
      const { content, description, position } = req.body;

      const updatedCard = await prisma.card.update({
        where: { id },
        data: {
          ...(content !== undefined ? { content } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(position !== undefined ? { position } : {}),
        },
      });

      return res.status(200).json(updatedCard);
    }

    if (req.method === "DELETE") {
      await prisma.card.delete({ where: { id } });
      return res.status(200).json({ message: "Card deleted" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch {
    return res.status(500).json({ error: "Server error" });
  }
}
