import PropTypes from "prop-types";
import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";

const TicketDetailsDrawer = ({
  isOpen,
  onClose,
  title,
  description,
  progress,
  assignee,
  onUpdate,
}) => {
  const { userList, currentUserData } = useSelector((state) => state.users);

  const canEdit = currentUserData?.role === "Admin" || currentUserData?.role === "Manager";

  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDescription, setEditedDescription] = useState(description);
  const [editedAssignee, setEditedAssignee] = useState(assignee);

  useEffect(() => {
    if (isOpen) {
      setEditedTitle(title);
      setEditedDescription(description);
      setEditedAssignee(assignee);
    }
  }, [isOpen, title, description, assignee]);

  const assignedUser = userList.find((user) => user.uid === editedAssignee);
  const assignedUserName = assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}` : "Unassigned";
  const assignedUserInitials = assignedUserName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleSave = () => {
    if (editedTitle !== title) onUpdate("title", editedTitle);
    if (editedDescription !== description) onUpdate("description", editedDescription);
    if (editedAssignee !== assignee) onUpdate("assignedTo", editedAssignee);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => (document.body.style.overflow = "");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black bg-opacity-40 z-40"
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="fixed top-0 right-0 h-screen w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-white shadow-xl z-50 flex flex-col"
      >
        <header className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 id="drawer-title" className="text-xl font-bold text-gray-900 truncate">
            Ticket Details
          </h2>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>


        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <section>
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
              Title
            </h3>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter ticket title"
            />
          </section>
          <section>
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
              Description
            </h3>
            <textarea
              rows={6}
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              placeholder="Add detailed description here..."
              className="w-full rounded-md border border-gray-300 p-3 text-gray-900 placeholder-gray-400 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </section>
          <section>
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
              Assigned to
            </h3>
            {canEdit ? (
              <select
                value={editedAssignee}
                onChange={(e) => setEditedAssignee(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Unassigned</option>
                {userList.map((user) => (
                  <option key={user.uid} value={user.uid}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center font-semibold text-xs uppercase shadow-sm select-none">
                  {assignedUserInitials || "U"}
                </div>
                <span className="text-gray-800">{assignedUserName}</span>
              </div>
            )}
          </section>
          <section>
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
              Status
            </h3>
            <span
              className={`inline-block px-5 py-2 rounded-full text-sm font-semibold select-none ${progress === "Completed"
                ? "bg-green-100 text-green-800"
                : progress === "InProgress"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-600"
                }`}
            >
              {progress}
            </span>
          </section>
        </main>
        <footer className="flex justify-end gap-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Save Changes
          </button>
        </footer>
      </aside>
    </>
  );
};

TicketDetailsDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  progress: PropTypes.string,
  assignee: PropTypes.string,
  onUpdate: PropTypes.func.isRequired,
};

export default TicketDetailsDrawer;
