import PropTypes from "prop-types";
import { useEffect } from "react";
import { fetchAllUsers } from "../../store/slices/userSlice";
import { useDispatch, useSelector } from "react-redux";

const Modal = ({
  isOpen,
  onClose,
  onSubmit,
  values,
  handleChange,
  isEditing,
}) => {
  const dispatch = useDispatch();
  const { userList } = useSelector((state) => state.users);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchAllUsers());
    }
  }, [dispatch, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm px-4 pt-16">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6 relative overflow-hidden">
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h2 className="text-xl font-bold text-gray-800">
            {isEditing ? "Edit Task" : "Create New Task"}
          </h2>
          <button
            className="text-gray-500 hover:text-red-600 text-2xl"
            onClick={onClose}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Task Title
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              type="text"
              name="title"
              placeholder="e.g. Fix login bug"
              onChange={handleChange}
              value={values.title}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
              name="description"
              placeholder="Details about the task..."
              rows={4}
              onChange={handleChange}
              value={values.description}
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Assign To
            </label>
            <div className="relative">
              <select
                id="assignedTo"
                name="assignedTo"
                className="appearance-none w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none pr-10"
                value={values.assignedTo}
                onChange={handleChange}
              >
                <option value="">Select a user</option>
                {userList.map((user) => (
                  <option key={user.id} value={user.uid}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>


          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool,
  isEditing: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  values: PropTypes.object,
  handleChange: PropTypes.func,
};

export default Modal;
