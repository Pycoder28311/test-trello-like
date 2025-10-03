import { prisma } from '../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.setHeader('Allow', ['PUT']).status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const { userId, lastProjectId } = req.body;

    if (!userId) return res.status(400).json({ error: "userId is required" });
    if (!lastProjectId) return res.status(400).json({ error: "lastProjectId is required" });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { lastProjectId },
    });

    return res.status(200).json(updatedUser);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update lastProjectId" });
  }
}
