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
  progress,
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

  const borderProgressStyle = progress === "Todo"
    ? "border-l-gray-400 border-l-4"
    : progress === "InProgress"
      ? "border-l-yellow-500 border-l-4"
      : progress === "Completed"
        ? "border-l-green-500 border-l-4"
        : "border-l-gray-300 border-l-4"

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={`bg-white border-2 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-4 sm:p-5 w-full max-w-full
         ${borderProgressStyle}`}
    >

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-4">
        <div className="flex-1 min-w-0">
          {isEditingTitle ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => e.key === "Enter" && handleTitleBlur()}
              className="text-base sm:text-lg md:text-xl font-semibold w-full px-2 py-1 border-b border-gray-300 focus:outline-none focus:border-blue-500"
              autoFocus
            />
          ) : (
            <h1
              className="text-lg sm:text-xl text-gray-800 font-semibold cursor-pointer hover:text-blue-600 transition-colors break-words"
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
              className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={3}
              autoFocus
            />
          ) : (
            <p
              className="mt-2 text-gray-600 cursor-pointer text-sm sm:text-base leading-relaxed line-clamp-3 h-12"
              onClick={() => setIsEditingDescription(true)}
            >
              {isReadMore ? description.slice(0, 130) : description}
              {description.length > 130 && (
                <span
                  onClick={() => setIsModalOpen(true)}
                  className="text-blue-500 ml-1 font-medium hover:underline"
                >
                  {isReadMore && "...read more"}
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-gray-500">Assigned to:</span>
          {canEdit && isEditingAssignee ? (
            <select
              value={editedAssignee}
              onChange={handleAssigneeChange}
              onBlur={() => setIsEditingAssignee(false)}
              className="text-sm px-2 py-1 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            >
              {userList.map((user) => (
                <option key={user.id} value={user.uid}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
          ) : (
            <div
              className={`flex items-center gap-2 ${canEdit ? "cursor-pointer hover:underline" : "cursor-default"}`}
              onClick={() => canEdit && handleAssignedClick()}
            >
              <div className="w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center font-semibold text-[10px] shadow-sm uppercase">
                {AssignUser?.split(" ").map((name) => name[0]).join("")}
              </div>
              <span className="text-sm font-medium text-gray-800 break-words">{AssignUser}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canEdit && (
            <button
              onClick={handleDelete}
              className="p-2 text-red-500 hover:text-red-600 transition"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          )}

          <button
            disabled={handleDisable === 0}
            onClick={handlePrevious}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${handleDisable === 0
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
          >
            Previous
          </button>

          <button
            disabled={handleDisable >= 2}
            onClick={handleNext}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${handleDisable >= 2
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-black text-white hover:bg-gray-800"
              }`}
          >
            Next
          </button>
        </div>
      </div>

      <TicketModal
        progress={progress}
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
  onUpdate: PropTypes.func,
};

export default Card;
