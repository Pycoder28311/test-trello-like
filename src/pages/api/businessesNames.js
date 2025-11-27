import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { projectId } = req.query;

  if (!projectId) {
    return res.status(400).json({ error: "projectId is required" });
  }

  try {
    // Fetch columns with their cards
    const columnsWithCards = await prisma.boardColumn.findMany({
      where: { projectId: projectId },
      select: {
        title: true, // column name
        cards: {
          select: { content: true } // only card names
        }
      }
    });

    if (!columnsWithCards.length) {
      return res.status(404).json({ error: "No columns found for this project" });
    }

    // Map column name to an array of card names
    const result = columnsWithCards.map(col => ({
      title: col.title,
      cards: col.cards.map(card => card.content)
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}
