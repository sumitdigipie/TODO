import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const TicketDetailsDrawer = ({
  isOpen,
  onClose,
  title,
  description,
  assignee,
  onUpdate,
}) => {
  const { userList, currentUserData } = useSelector((state) => state.users);

  const canEdit =
    currentUserData?.role === "Admin" || currentUserData?.role === "Manager";

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
  const assignedUserName = assignedUser
    ? `${assignedUser.firstName} ${assignedUser.lastName}`
    : "Unassigned";
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
    const onKeyDown = (e) => e.key === "Escape" && onClose();
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
    <div>
      <div
        onClick={onClose}
        className="fixed top-[68px] left-0 right-0 bottom-0 bg-black/30 backdrop-blur-sm z-40"
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="fixed top-[68px] right-0 h-[calc(100vh-68px)] w-full sm:max-w-lg md:max-w-xl bg-white z-50 flex flex-col shadow-2xl rounded-l-2xl transition-transform duration-300"
      >

        <header className="sticky top-0 px-6 py-4 bg-white border-b flex items-center justify-between">
          <h2 id="drawer-title" className="text-xl font-semibold text-gray-800">
            Ticket Details
          </h2>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-6 space-y-6">
          <section className="bg-white p-4 rounded-xl shadow-sm space-y-2">
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              placeholder="Enter ticket title"
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </section>

          <section className="bg-white p-4 rounded-xl shadow-sm space-y-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={8}
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              placeholder="Add a detailed description..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none resize-y"
            />
          </section>

          <section className="bg-white p-4 rounded-xl shadow-sm space-y-2">
            <label className="block text-sm font-medium text-gray-700">Assigned To</label>
            {canEdit ? (
              <select
                value={editedAssignee}
                onChange={(e) => setEditedAssignee(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-sky-500"
              >
                {userList.map((user) => (
                  <option key={user.uid} value={user.uid}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-3 mt-1">
                <div className="w-9 h-9 rounded-full bg-sky-600 text-white flex items-center justify-center font-semibold text-xs uppercase shadow-md">
                  {assignedUserInitials}
                </div>
                <span className="text-sm text-gray-800 font-medium">{assignedUserName}</span>
              </div>
            )}
          </section>
        </main>

        <footer className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-md transition"
          >
            Save Changes
          </button>
        </footer>
      </aside>
    </div>
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
