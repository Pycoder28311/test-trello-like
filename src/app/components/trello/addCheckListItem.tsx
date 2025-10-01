import React, { useState } from "react";

interface ChecklistInputProps {
  addChecklistItem: (text: string) => void;
}

const ChecklistInput = ({ addChecklistItem }: ChecklistInputProps) => {
  const [text, setText] = useState("");

  const handleAdd = () => {
    if (text.trim()) {
      addChecklistItem(text);
      setText(""); // clear input
    }
  };

  return (
    <div className="flex gap-2 mt-2">
      <input
        type="text"
        placeholder="New item..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleAdd();
          }
        }}
        className="flex-1 border rounded p-2 w-10"
      />
      <button
        onClick={handleAdd}
        className="px-3 bg-blue-500 text-white rounded"
      >
        Add
      </button>
    </div>
  );
};

export default ChecklistInput;
