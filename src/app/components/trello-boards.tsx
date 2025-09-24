"use client";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { TrelloBoardsProps } from './types/tabs';

// Correctly typed component
const TrelloBoards: React.FC<TrelloBoardsProps> = ({
  columns,
  newCardTexts,
  newColumnTitle,
  setNewColumnTitle,
  isAddingColumn,
  setIsAddingColumn,
  handleDragEnd,
  handleInputChange,
  addCard,
  deleteCard,
  addColumn,
  deleteColumn,
}) => {

  return (
    <div className="p-8 overflow-x-auto">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="columns" direction="horizontal" type="COLUMN">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex overflow-x-auto"
            >
              {columns.map((col, index) => (
                <Draggable key={col.id} draggableId={col.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="flex-shrink-0 mr-6"
                      style={{
                        ...provided.draggableProps.style,
                        opacity: snapshot.isDragging ? 0.8 : 1,
                      }}
                    >
                      <div
                        className="bg-gray-200 p-4 rounded-md w-80 min-h-[60px] flex flex-col"
                      >
                        {/* Column header with drag handle and delete button */}
                        <div className="flex justify-between items-center mb-4">
                          <div
                            {...provided.dragHandleProps}
                            className="font-bold cursor-grab active:cursor-grabbing flex items-center gap-2"
                          >
                            <span className="text-gray-500">⠿</span>
                            <span>{col.title}</span>
                          </div>
                          <button
                            onClick={() => deleteColumn(col.id)}
                            className="text-red-500 font-bold hover:text-red-700 text-lg"
                            title="Delete column"
                          >
                            ×
                          </button>
                        </div>

                        <Droppable droppableId={col.id}>
                          {(provided, snapshot) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className={`flex-1 transition-colors duration-200 ${
                                snapshot.isDraggingOver 
                                  ? 'bg-blue-50 rounded' 
                                  : ''
                              } ${
                                col.cards.length === 0 
                                  ? 'min-h-[60px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded' 
                                  : ''
                              }`}
                            >
                              {col.cards.length === 0 && !snapshot.isDraggingOver && (
                                <p className="text-gray-400 text-sm">Drop cards here</p>
                              )}
                              
                              {col.cards.map((card, index) => (
                                <Draggable
                                  key={card.id}
                                  draggableId={card.id}
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`p-4 mb-2 rounded shadow flex justify-between items-center ${
                                        snapshot.isDragging
                                          ? "bg-blue-200"
                                          : "bg-white"
                                      }`}
                                    >
                                      <span>{card.content}</span>
                                      <button
                                        onClick={() =>
                                          deleteCard(col.id, card.id)
                                        }
                                        className="text-red-500 font-bold hover:text-red-700"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>

                        {/* Input to add new card */}
                        <div className="mt-2 flex gap-2">
                          <input
                            type="text"
                            placeholder="New card..."
                            value={newCardTexts[col.id] || ""}
                            onChange={(e) =>
                              handleInputChange(col.id, e.target.value)
                            }
                            className="flex-1 p-2 rounded border border-gray-300"
                          />
                          <button
                            onClick={() => addCard(col.id)}
                            className="px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              
              {/* Add Column Button */}
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
                        if (e.key === 'Enter') addColumn();
                        if (e.key === 'Escape') {
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
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

export default TrelloBoards;