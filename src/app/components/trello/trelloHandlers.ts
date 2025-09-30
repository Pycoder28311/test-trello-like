import { Card } from "../types/tabsAndTrello"; // import your types
import { TrelloHandlersProps } from "../types/tabsAndTrello";

export const trelloHandlers = (props: TrelloHandlersProps) => {
  const {
    columns,
    setColumns,
    selectedCard,
    setSelectedCard,
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

  const addChecklistItemInCard = (card: Card, text: string) => {
    if (!card || !text.trim()) return;
    const newChecklist = [...(card.checklist || []), { text, completed: false }];
    const updatedCard = { ...card, checklist: newChecklist };
    updateCard(updatedCard);
  };

  const deleteChecklistItem = (cardId: string, index: number) => {
    setColumns((prevCols) =>
      prevCols.map((col) => ({
        ...col,
        cards: col.cards.map((c) => {
          if (c.id !== cardId) return c;
          const updated = [...(c.checklist ?? [])];
          updated.splice(index, 1);
          return { ...c, checklist: updated };
        }),
      }))
    );
  };

  const addCard = (columnId: string, text: string) => {
    if (!text) return;
    const newColumns = columns.map((col) =>
      col.id === columnId
        ? { ...col, cards: [...col.cards, { id: Date.now().toString(), content: text, checklist: [] }] }
        : col
    );
    setColumns(newColumns);
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

  const editChecklistItem = (cardId: string, index: number, newText: string) => {
    setColumns((prevColumns) =>
      prevColumns.map((col) => ({
        ...col,
        cards: col.cards.map((c) => {
          if (c.id === cardId) {
            // Copy the checklist array
            const updatedChecklist = [...(c.checklist ?? [])];
            // Update the text of the specific item
            updatedChecklist[index] = { ...updatedChecklist[index], text: newText };
            return { ...c, checklist: updatedChecklist };
          }
          return c;
        }),
      }))
    );
    console.log(cardId,index,newText)

    // Optional: if you have selectedCard state, update it too
    setSelectedCard((prev) => {
      if (!prev || prev.id !== cardId) return prev;
      const updatedChecklist = [...(prev.checklist ?? [])];
      updatedChecklist[index] = { ...updatedChecklist[index], text: newText };
      return { ...prev, checklist: updatedChecklist };
    });
  };

  return {
    openCardModal,
    closeCardModal,
    saveCardEdit,
    handleDescriptionChange,
    toggleChecklistItem,
    addChecklistItem,
    addChecklistItemInCard,
    addCard,
    deleteCard,
    addColumn,
    deleteColumn,
    deleteChecklistItem,
    editChecklistItem,
  };
};
