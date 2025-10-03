import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id, title, favicon, position } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const project = await prisma.project.create({
      data: {
        id,
        title,
        favicon,
        position: position ?? 0,
        isActive: true,
        isNew: false,
      },
    });

    return res.status(201).json(project);
  } catch {
    return res.status(500).json({ error: "Failed to create project" });
  }
}
