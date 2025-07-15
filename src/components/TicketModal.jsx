import PropTypes from "prop-types";
import { useSelector } from "react-redux";

const TicketModal = ({
  isOpen,
  onClose,
  title,
  description,
  editedAssignee,
}) => {
  if (!isOpen) return null;
  const { userList } = useSelector((state) => state.users);

  const userDetails = userList.find((user) => user.uid === editedAssignee);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-all duration-300 ease-in-out">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full relative transform transition-all scale-100 opacity-100">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-lg"
          onClick={onClose}
        >
          &#x2715;
        </button>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Ticket Details</h2>
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>

          <p className="mt-3 text-gray-600 leading-relaxed text-base overflow-y-auto max-h-60">{description}</p>

          <div className="mt-4">
            <span className="text-sm text-gray-500">Assigned to:</span>
            <p className="text-lg font-medium text-gray-700">{userDetails?.firstName} {userDetails?.lastName}</p>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

TicketModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.string,
  description: PropTypes.string,
  editedAssignee: PropTypes.string,
};

export default TicketModal;
