import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    if (req.method === "GET") {
      // Read one project with ordered relations
      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          columns: {
            orderBy: { position: "asc" },
            include: {
              cards: {
                orderBy: { position: "asc" },
                include: {
                  checklist: {
                    orderBy: { position: "asc" },
                  },
                },
              },
            },
          },
        },
      });

      if (!project) return res.status(404).json({ error: "Not found" });
      return res.status(200).json(project);
    }

    if (req.method === "PUT") {
      // Update project
      const { title, favicon, isActive, isNew, position } = req.body;
      const project = await prisma.project.update({
        where: { id },
        data: { title, favicon, isActive, isNew, position },
      });
      return res.status(200).json(project);
    }

    if (req.method === "DELETE") {
      // Delete project
      await prisma.project.delete({ where: { id } });
      return res.status(200).json({ message: "Project deleted" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch {
    return res.status(500).json({ error: "Server error" });
  }
}
