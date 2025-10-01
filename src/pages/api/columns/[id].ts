import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid column ID" });
  }

  try {
    if (req.method === "PUT") {
      // Edit column
      const { title, position } = req.body;

      const updatedColumn = await prisma.column.update({
        where: { id },
        data: {
          ...(title !== undefined ? { title } : {}),
          ...(position !== undefined ? { position } : {}),
        },
      });

      return res.status(200).json(updatedColumn);
    }

    if (req.method === "DELETE") {
      // Delete column
      await prisma.column.delete({ where: { id } });
      return res.status(200).json({ message: "Column deleted" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch {
    return res.status(500).json({ error: "Server error" });
  }
}
