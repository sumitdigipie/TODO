import { BookCheck, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUsers } from "../store/slices/userSlice";

const Card = ({
  title,
  description,
  AssignUser,
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
  const [isEditingAssignee, setIsEditingAssignee] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDescription, setEditedDescription] = useState(description);
  const [editedAssignee, setEditedAssignee] = useState(AssignUser);

  const { userList } = useSelector((state) => state.users);
  const dispatch = useDispatch();

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

  const handleAssigneeChange = (e) => {
    setEditedAssignee(e.target.value);
    onUpdate("assignedTo", e.target.value);
    setIsEditingAssignee(false);
  };

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

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
              className="
              "
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
              className="w-full mt-2 px-1 border bg-gray-200"
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
        <div className="flex items-center justify-between p-3 rounded-md bg-white shadow-sm">
          <div className="mr-5">
            <span className="text-sm text-gray-500">Assigned to:</span>
            {isEditingAssignee ? (
              <select
                value={editedAssignee}
                onChange={handleAssigneeChange}
                onBlur={() => setIsEditingAssignee(false)}
                className="text-lg font-medium text-gray-800 bg-white border px-1"
                autoFocus
              >
                {userList.map((user) => (
                  <option
                    key={user.id}
                    value={`${user.firstName} ${user.lastName}`}
                  >
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
            ) : (
              <h1
                className="text-lg font-medium text-gray-800 cursor-pointer"
                onClick={() => setIsEditingAssignee(true)}
              >
                {AssignUser}
              </h1>
            )}
          </div>

          <div className="flex gap-2">
            <button
              disabled={handleDisable === 0}
              onClick={handlePrevious}
              className={`px-4 py-2 rounded transition-colors text-white ${
                handleDisable === 0
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              Previous
            </button>

            <button
              disabled={handleDisable >= 2}
              onClick={handleNext}
              className={`px-4 py-2 rounded transition-colors text-white ${
                handleDisable >= 2
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black hover:bg-gray-800"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

Card.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  AssignUser: PropTypes.string,
  handleDisable: PropTypes.number,
  handleDelete: PropTypes.func,
  onDragStart: PropTypes.func,
  handlePrevious: PropTypes.func,
  handleNext: PropTypes.func,
  isCompleted: PropTypes.bool,
  onUpdate: PropTypes.func,
};

export default Card;
