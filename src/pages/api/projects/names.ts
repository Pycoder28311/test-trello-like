import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        title: true,
        position: true,
      },
      orderBy: { position: "asc" },
    });

    return res.status(200).json(projects);
  } catch {
    return res.status(500).json({ error: "Failed to fetch project names" });
  }
}
