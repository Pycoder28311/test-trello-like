"use client";

import React, { useState } from "react";

interface AddCardInputProps {
  colId: string;
  addCard: (colId: string, text: string) => void;
}

const AddCardInput = ({ colId, addCard }: AddCardInputProps) => {
  const [text, setText] = useState("");

  const handleAdd = () => {
    if (text.trim()) {
      addCard(colId, text);
      setText(""); // clear input after adding
    }
  };

  return (
    <div className="mt-2 flex gap-2">
      <input
        type="text"
        placeholder="New card..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleAdd();
          }
        }}
        className="flex-1 p-2 rounded border border-gray-300"
      />
      <button
        onClick={handleAdd}
        className="px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Add
      </button>
    </div>
  );
};

export default AddCardInput;
