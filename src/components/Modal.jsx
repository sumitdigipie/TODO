import PropTypes from "prop-types";
import { useEffect } from "react";
import { fetchAllUsers } from "../store/slices/userSlice";
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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
        <div className="flex justify-center items-center mb-4 font-bold">
          <h2>Add ticket</h2>
          <button
            className="absolute top-4 right-6 text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            &#x2715;
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-6">
          <input
            className="w-full p-3 border border-gray-500 rounded"
            type="text"
            name="title"
            placeholder="Enter title of post"
            onChange={handleChange}
            value={values.title}
          />
          <textarea
            className="w-full p-3 border border-gray-500 rounded"
            name="description"
            placeholder="Enter description of post"
            onChange={handleChange}
            value={values.description}
          />

          <div>
            <label
              htmlFor="countries"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Assign task to
            </label>
            <select
              id="assignedTo"
              name="assignedTo"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              value={values.assignedTo}
              onChange={handleChange}
            >
              <option value="">Assign to</option>
              {userList.map((user) => (
                <option
                  key={user.id}
                  value={`${user.firstName} ${user.lastName}`}
                >
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {isEditing ? "Update" : "Submit"}
          </button>
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
