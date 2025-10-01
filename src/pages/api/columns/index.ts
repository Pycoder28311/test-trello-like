import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { projectId, title } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: "projectId is required" });
    }

    // Count existing columns to assign default position
    const columnCount = await prisma.boardColumn.count({
      where: { projectId },
    });

    const column = await prisma.boardColumn.create({
      data: {
        title: title || "New Column",
        projectId,
        position: columnCount,
      },
    });

    return res.status(201).json(column);
  } catch {
    return res.status(500).json({ error: "Failed to create column" });
  }
}
