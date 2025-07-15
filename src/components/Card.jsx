import { BookCheck, Ticket, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUsers } from "../store/slices/userSlice";
import TicketModal from "./TicketModal";

const Card = ({
  title,
  description,
  AssignUser,
  AssignUserId,
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDescription, setEditedDescription] = useState(description);
  const [editedAssignee, setEditedAssignee] = useState(AssignUserId);
  const [isReadMore, setIsReadMore] = useState(true);

  const { userList, currentUserData } = useSelector((state) => state.users);
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

  const handleAssignedClick = () => {
    setIsEditingAssignee(true);
    let assignedValue = userList.find((item) => item.uid === AssignUserId).uid;
    setEditedAssignee(assignedValue);
  };

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const canEdit =
    currentUserData?.role === "Admin" || currentUserData?.role === "Manager";

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={`border rounded-xl shadow-sm p-6 transition-colors duration-300 ${isCompleted
        ? "border-green-400 bg-green-50"
        : "border-gray-200 bg-white"
        }`}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          {isEditingTitle ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => e.key === "Enter" && handleTitleBlur()}
              className="text-2xl font-semibold w-full px-2 py-1 border-b border-gray-300 focus:outline-none focus:border-blue-500"
              autoFocus
            />
          ) : (
            <h1
              className="text-2xl font-semibold cursor-pointer hover:text-blue-600"
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
              className="w-full mt-2 p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-wrap"
              rows={3}
              autoFocus
            />
          ) : (
            <p
              className="mt-2 text-gray-700 cursor-pointer "
              onClick={() => setIsEditingDescription(true)}
            >
              {isReadMore ? description.slice(0, 110) : description}
              {description.length > 110 && (
                <span
                  onClick={() => {
                    setIsModalOpen(true);
                  }}
                  className="text-blue-500 cursor-pointer"
                >
                  {isReadMore && '...read more'}
                </span>
              )}
            </p>
          )}
        </div>
        {isCompleted && <BookCheck className="text-green-600 mt-1" size={28} />}
      </div>

      <div className="mt-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Assigned to:</span>
          {canEdit && isEditingAssignee ? (
            <select
              value={editedAssignee}
              onChange={handleAssigneeChange}
              onBlur={() => setIsEditingAssignee(false)}
              className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            >
              {userList.map((user) => (
                <option key={user.id} value={user.uid}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
          ) : (
            <span
              className={`text-base font-medium text-gray-800 ${canEdit ? "cursor-pointer hover:underline" : "cursor-default"
                }`}
              onClick={() => {
                if (canEdit) handleAssignedClick();
              }}
            >
              {AssignUser}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              type="button"
              onClick={handleDelete}
              aria-label="Delete"
              className="p-2 rounded-md bg-red-100 hover:bg-red-200 text-red-600"
            >
              <Trash2 />
            </button>
          )}

          <button
            disabled={handleDisable === 0}
            onClick={handlePrevious}
            className={`px-4 py-2 rounded-md transition-colors text-white ${handleDisable === 0
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
              }`}
          >
            Previous
          </button>

          <button
            disabled={handleDisable >= 2}
            onClick={handleNext}
            className={`px-4 py-2 rounded-md transition-colors text-white ${handleDisable >= 2
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-black hover:bg-gray-800"
              }`}
          >
            Next
          </button>
        </div>
      </div>

      <TicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editedTitle}
        description={editedDescription}
        editedAssignee={editedAssignee}
      />
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
