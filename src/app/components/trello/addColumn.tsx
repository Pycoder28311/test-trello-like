import React from "react";

interface AddColumnProps {
  isAddingColumn: boolean;
  setIsAddingColumn: React.Dispatch<React.SetStateAction<boolean>>;
  newColumnTitle: string;
  setNewColumnTitle: React.Dispatch<React.SetStateAction<string>>;
  addColumn: () => void;
}

const AddColumn: React.FC<AddColumnProps> = ({
  isAddingColumn,
  setIsAddingColumn,
  newColumnTitle,
  setNewColumnTitle,
  addColumn,
}) => {
  return (
    <div className="flex-shrink-0 mr-6">
      {isAddingColumn ? (
        <div className="bg-gray-100 p-4 rounded-md w-80 min-h-[60px] flex flex-col">
          <input
            type="text"
            placeholder="Column title..."
            value={newColumnTitle}
            onChange={(e) => setNewColumnTitle(e.target.value)}
            className="p-2 rounded border border-gray-300 mb-2"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") addColumn();
              if (e.key === "Escape") {
                setIsAddingColumn(false);
                setNewColumnTitle("");
              }
            }}
          />
          <div className="flex gap-2">
            <button
              onClick={addColumn}
              className="flex-1 px-4 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Add Column
            </button>
            <button
              onClick={() => {
                setIsAddingColumn(false);
                setNewColumnTitle("");
              }}
              className="px-4 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingColumn(true)}
          className="bg-gray-200 hover:bg-gray-300 p-4 rounded-md w-80 min-h-[60px] flex items-center justify-center text-gray-600 font-medium transition-colors"
        >
          + Add Column
        </button>
      )}
    </div>
  );
};

export default AddColumn;
