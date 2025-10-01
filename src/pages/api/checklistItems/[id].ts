import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid checklist item ID" });
  }

  try {
    if (req.method === "PUT") {
      const { text, completed, position } = req.body;

      const updatedItem = await prisma.checklistItem.update({
        where: { id },
        data: {
          ...(text !== undefined ? { text } : {}),
          ...(completed !== undefined ? { completed } : {}),
          ...(position !== undefined ? { position } : {}),
        },
      });

      return res.status(200).json(updatedItem);
    }

    if (req.method === "DELETE") {
      await prisma.checklistItem.delete({ where: { id } });
      return res.status(200).json({ message: "Checklist item deleted" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch {
    return res.status(500).json({ error: "Server error" });
  }
}
