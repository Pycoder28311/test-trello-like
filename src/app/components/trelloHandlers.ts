// trelloHandlers.ts
import { Dispatch, SetStateAction } from "react";
import { Column, Card, ChecklistItem } from "./types/tabs"; // import your types

interface TrelloHandlersProps {
  columns: Column[];
  setColumns: Dispatch<SetStateAction<Column[]>>;
  selectedCard: Card | null;
  setSelectedCard: Dispatch<SetStateAction<Card | null>>;
  newCardTexts: { [key: string]: string };
  setNewCardTexts: Dispatch<SetStateAction<{ [key: string]: string }>>;
  newColumnTitle: string;
  setNewColumnTitle: Dispatch<SetStateAction<string>>;
  setIsAddingColumn: Dispatch<SetStateAction<boolean>>;
  editText: string;
  setEditText: Dispatch<SetStateAction<string>>;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
}

export const trelloHandlers = (props: TrelloHandlersProps) => {
  const {
    columns,
    setColumns,
    selectedCard,
    setSelectedCard,
    newCardTexts,
    setNewCardTexts,
    newColumnTitle,
    setNewColumnTitle,
    setIsAddingColumn,
    editText,
    setEditText,
    setIsEditing,
  } = props;

  const openCardModal = (card: Card) => {
    setSelectedCard(card);
    setEditText(card.content);
    setIsEditing(false);
  };

  const closeCardModal = () => {
    setSelectedCard(null);
  };

  const updateCard = (updatedCard: Card) => {
    setColumns((prevColumns) =>
      prevColumns.map((col) => ({
        ...col,
        cards: col.cards.map((c) =>
          c.id === updatedCard.id ? { ...c, ...updatedCard } : c
        ),
      }))
    );
  };

  const saveCardEdit = () => {
    if (!selectedCard) return;
    const updatedCard = { ...selectedCard, content: editText };
    setSelectedCard(updatedCard);
    updateCard(updatedCard);
    setIsEditing(false);
  };

  const handleDescriptionChange = (value: string) => {
    if (!selectedCard) return;
    const updatedCard = { ...selectedCard, description: value };
    setSelectedCard(updatedCard);
    updateCard(updatedCard);
  };

  const toggleChecklistItem = (index: number) => {
    if (!selectedCard) return;
    const newChecklist = [...(selectedCard.checklist || [])];
    newChecklist[index].completed = !newChecklist[index].completed;
    const updatedCard = { ...selectedCard, checklist: newChecklist };
    setSelectedCard(updatedCard);
    updateCard(updatedCard);
  };

  const addChecklistItem = (text: string) => {
    if (!selectedCard || !text.trim()) return;
    const newChecklist = [...(selectedCard.checklist || []), { text, completed: false }];
    const updatedCard = { ...selectedCard, checklist: newChecklist };
    setSelectedCard(updatedCard);
    updateCard(updatedCard);
  };

  const handleInputChange = (columnId: string, value: string) => {
    setNewCardTexts({ ...newCardTexts, [columnId]: value });
  };

  const addCard = (columnId: string) => {
    const text = newCardTexts[columnId]?.trim();
    if (!text) return;
    const newColumns = columns.map((col) =>
      col.id === columnId
        ? { ...col, cards: [...col.cards, { id: Date.now().toString(), content: text }] }
        : col
    );
    setColumns(newColumns);
    setNewCardTexts({ ...newCardTexts, [columnId]: "" });
  };

  const deleteCard = (columnId: string, cardId: string) => {
    setColumns(columns.map((col) =>
      col.id === columnId ? { ...col, cards: col.cards.filter(c => c.id !== cardId) } : col
    ));
  };

  const addColumn = () => {
    const title = newColumnTitle.trim();
    if (!title) return;
    setColumns([...columns, { id: `col-${Date.now()}`, title, cards: [] }]);
    setNewColumnTitle("");
    setIsAddingColumn(false);
  };

  const deleteColumn = (columnId: string) => {
    setColumns(columns.filter(col => col.id !== columnId));
  };

  return {
    openCardModal,
    closeCardModal,
    saveCardEdit,
    handleDescriptionChange,
    toggleChecklistItem,
    addChecklistItem,
    handleInputChange,
    addCard,
    deleteCard,
    addColumn,
    deleteColumn,
  };
};
