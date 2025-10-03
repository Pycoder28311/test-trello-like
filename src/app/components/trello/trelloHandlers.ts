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
    activeProjectId,
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

    // Only update the description
    setSelectedCard((prev) =>
      prev ? { ...prev, description: value } : prev
    );

    // Update only the description in the board state
    updateCard({
      id: selectedCard.id,
      content: editText,
      description: value,
    });
  };

  const toggleChecklistItem = (index: number) => {
    if (!selectedCard) return;
    const newChecklist = [...(selectedCard.checklist || [])];
    newChecklist[index].completed = !newChecklist[index].completed;
    const updatedCard = { ...selectedCard, checklist: newChecklist };
    setSelectedCard(updatedCard);
    updateCard(updatedCard);
  };

  const addChecklistItem = async (text: string) => {
    if (!selectedCard || !text.trim()) return;

    // Generate an ID for the checklist item
    const checklistId = `check-${Date.now()}`;

    // 2️⃣ Call API to create checklist item in DB
    try {
      const res = await fetch("/api/checklistItems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: checklistId,          // optional: frontend-generated ID
          cardId: selectedCard.id,  // the card this item belongs to
          text,
          completed: false,
        }),
      });

      if (!res.ok) throw new Error("Failed to add checklist item");

      // 1️⃣ Update local state
      const newChecklist = [
        ...(selectedCard.checklist || []),
        { id: checklistId, text, completed: false },
      ];
      const updatedCard = { ...selectedCard, checklist: newChecklist };
      setSelectedCard(updatedCard);
      // 3️⃣ Update card in local state if needed
      updateCard(updatedCard);

      // Optionally, replace the frontend state with DB response
      // const newItem = await res.json();
    } catch (err) {
      console.error(err);
    }

  };

  const addChecklistItemInCard = async (card: Card, text: string) => {
    if (!card || !text.trim()) return;

    // Generate frontend ID for checklist item
    const checklistId = `check-${Date.now()}`;

    // 2️⃣ Call API to create checklist item in DB
    try {
      const res = await fetch("/api/checklistItems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: checklistId,   // frontend-generated ID
          cardId: card.id,
          text,
          completed: false,
        }),
      });

      if (!res.ok) throw new Error("Failed to add checklist item");

      // 1️⃣ Update card locally
      const newChecklist = [...(card.checklist || []), { id: checklistId, text, completed: false }];
      const updatedCard = { ...card, checklist: newChecklist };
      // 3️⃣ Update the card in your state
      updateCard(updatedCard);

      // Optionally, you could replace local item with DB response
      // const newItem = await res.json();
    } catch (err) {
      console.error(err);
    }

  };

  const deleteChecklistItem = async (cardId: string, checklistItemId: string) => {
    // 1️⃣ Confirm deletion
    const confirmed = window.confirm("Are you sure you want to delete this checklist item?");
    if (!confirmed) return;

    // 3️⃣ Update local state after successful deletion
    setColumns((prevCols) =>
      prevCols.map((col) => ({
        ...col,
        cards: col.cards.map((c) => {
          if (c.id !== cardId) return c;
          const updated = (c.checklist ?? []).filter(item => item.id !== checklistItemId);
          return { ...c, checklist: updated };
        }),
      }))
    );

    if (selectedCard) {
      setSelectedCard((prev) => {
        if (!prev || prev.id !== cardId) return prev;
        const updatedChecklist = (prev.checklist ?? []).filter(item => item.id !== checklistItemId);
        return { ...prev, checklist: updatedChecklist };
      });
    }

    try {
      // 2️⃣ Call API to delete checklist item from DB
      const res = await fetch(`/api/checklistItems/${checklistItemId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete checklist item");

    } catch (err) {
      console.error(err);
      alert("Failed to delete checklist item. Please try again.");
    }
  };

  const addCard = async (columnId: string, text: string) => {
    if (!text) return;

    // Generate frontend ID for the card
    const cardId = `card-${Date.now()}`;

    try {
      // 2️⃣ Call API to create card in DB with the same ID
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: cardId,       // frontend ID sent to DB
          columnId,
          content: text,
        }),
      });

      if (!res.ok) throw new Error("Failed to create card");

      // 1️⃣ Update local state immediately
      const newColumns = columns.map((col) =>
        col.id === columnId
          ? { ...col, cards: [...col.cards, { id: cardId, content: text, checklist: [] }] }
          : col
      );
      setColumns(newColumns);

      // Optionally, you can replace local state with DB response
      // const newCard = await res.json();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCard = async (columnId: string, cardId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this card?");
    if (!confirmed) return;

    // 2️⃣ Update local state after successful deletion
    setColumns(columns.map((col) =>
      col.id === columnId
        ? { ...col, cards: col.cards.filter(c => c.id !== cardId) }
        : col
    ));

    try {
      // 1️⃣ Call API to delete card from DB
      const res = await fetch(`/api/cards/${cardId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete card");

      
    } catch (err) {
      console.error(err);
      alert("Failed to delete card. Please try again.");
    }
  };

  const addColumn = async () => {
    const title = newColumnTitle.trim();
    if (!title) return;

    // Generate ID on the frontend
    const columnId = `col-${Date.now()}`;

    try {
      // 2️⃣ Call API to create column in DB with the same ID
      const res = await fetch("/api/columns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: columnId,         // send frontend ID to DB
          projectId: activeProjectId,
          title,
        }),
      });

      if (!res.ok) throw new Error("Failed to create column");

      // 1️⃣ Update local state immediately
      setColumns([...columns, { id: columnId, title, cards: [] }]);
      setNewColumnTitle("");
      setIsAddingColumn(false);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteColumn = async (columnId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this column?");
    if (!confirmed) return;

    // 2️⃣ Update local state after successful deletion
    setColumns(columns.filter(col => col.id !== columnId));

    try {
      // 1️⃣ Call API to delete column from DB
      const res = await fetch(`/api/columns/${columnId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete column");

    } catch (err) {
      console.error(err);
      alert("Failed to delete column. Please try again.");
    }
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

  // Parent component (Columns container)
  const updateCardTitle = (columnId: string, cardId: string, newTitle: string) => {
    if (columnId == "") return;
    console.log(newTitle)
    setColumns((prevColumns) =>
      prevColumns.map((col) =>
        col.id === columnId
          ? {
              ...col,
              cards: col.cards.map((card) =>
                card.id === cardId ? { ...card, content: newTitle } : card
              ),
            }
          : col
      )
    );
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
    updateCardTitle,
  };
};
