import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const tableMap = {
  checklistItem: prisma.checklistItem,
  card: prisma.card,
  boardColumn: prisma.boardColumn,
  project: prisma.project,
} as const;

type TableName = keyof typeof tableMap;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { table } = req.query;

  if (typeof table !== "string" || !(table in tableMap)) {
    return res.status(400).json({ error: "Invalid table name" });
  }

  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { parentId, positions } = req.body;

  if (!Array.isArray(positions)) {
    return res.status(400).json({ error: "Positions must be an array" });
  }

  try {
    const updates = positions.map((item: { id: string; position: number }) => {
      switch (table as TableName) {
        case "checklistItem":
          return prisma.checklistItem.update({
            where: { id: item.id },
            data: { position: item.position, ...(parentId ? { cardId: parentId } : {}) },
          });
        case "card":
          return prisma.card.update({
            where: { id: item.id },
            data: { position: item.position, ...(parentId ? { columnId: parentId } : {}) },
          });
        case "boardColumn":
          return prisma.boardColumn.update({
            where: { id: item.id },
            data: { position: item.position, ...(parentId ? { projectId: parentId } : {}) },
          });
        case "project":
          return prisma.project.update({
            where: { id: item.id },
            data: { position: item.position },
          });
      }
    });

    const result = await prisma.$transaction(updates);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update positions" });
  }
}
