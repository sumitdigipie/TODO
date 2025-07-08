import { BookCheck, Trash2 } from "lucide-react";
import { useState } from "react";

import PropTypes from "prop-types";

const Card = ({
  title,
  description,
  handleDelete,
  isCompleted,
  handleNext,
  handlePrevious,
  handleDisable,
  onDragStart,
  onUpdate,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDescription, setEditedDescription] = useState(description);

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (editedTitle !== title) {
      onUpdate("title", editedTitle);
    }
  };

  const handleDescriptionBlur = () => {
    setIsEditingDescription(false);
    if (editedDescription !== description) {
      onUpdate("description", editedDescription);
    }
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e)}
      className={`border bg-gray-200 rounded-md p-4 ${
        isCompleted ? "border-green-500 bg-green-100" : "border-gray-300"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="w-full">
          {isEditingTitle ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => e.key === "Enter" && handleTitleBlur()}
              className="text-3xl font-bold w-full bg-white px-1 border-b"
              autoFocus
            />
          ) : (
            <h1
              className="text-3xl font-bold cursor-pointer"
              onClick={() => setIsEditingTitle(true)}
            >
              {title}
            </h1>
          )}

          {isEditingDescription ? (
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              onKeyDown={(e) => e.key === "Enter" && handleDescriptionBlur()}
              className="w-full mt-2 px-1 border bg-white"
              autoFocus
            />
          ) : (
            <p
              className="cursor-pointer mt-2"
              onClick={() => setIsEditingDescription(true)}
            >
              {description}
            </p>
          )}
        </div>
        {isCompleted ? <BookCheck color="#349400" /> : null}
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleDelete}
            aria-label="Delete"
            className="p-2 rounded hover:bg-gray-300"
          >
            <Trash2 />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            disabled={handleDisable === 0}
            onClick={handlePrevious}
            className="bg-blue-500 px-4 py-2 rounded text-cyan-50"
          >
            Previous
          </button>
          <button
            disabled={handleDisable >= 2}
            onClick={handleNext}
            className="bg-black px-4 py-2 rounded text-cyan-50 mr-3"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

Card.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  handleDisable: PropTypes.number,
  handleDelete: PropTypes.func,
  onDragStart: PropTypes.func,
  handlePrevious: PropTypes.func,
  handleNext: PropTypes.func,
  isCompleted: PropTypes.bool,
  onUpdate: PropTypes.func,
};

export default Card;
