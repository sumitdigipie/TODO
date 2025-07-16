import PropTypes from "prop-types";
import { useSelector } from "react-redux";

const TicketModal = ({
  isOpen,
  onClose,
  progress,
  title,
  description,
  editedAssignee,
}) => {
  if (!isOpen) return null;

  const { userList } = useSelector((state) => state.users);
  const userDetails = userList.find((user) => user.uid === editedAssignee);
  console.log('progress :>> ', progress);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4 pt-16">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl relative p-6">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="mb-6 border-b pb-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">Ticket ID: {Math.floor(Math.random() * 10000)}</p>
          </div>

          {userDetails && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg uppercase">
                {userDetails.firstName?.[0]}
              </div>
              <div className="text-sm">
                <p className="text-gray-700 font-medium">
                  {userDetails.firstName} {userDetails.lastName}
                </p>
                <p className="text-gray-400">{userDetails.email}</p>
              </div>
            </div>
          )}
        </div>
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-700 mb-2">Description</h4>
          <p className="text-gray-600 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
            {description}
          </p>
        </div>

        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-700 mb-2">Labels</h4>
          <div className="flex flex-wrap gap-2">
            <span
              className={`text-sm text-white ${progress === "Completed"
                ? "bg-green-600"
                : progress === "InProgress"
                  ? "bg-yellow-600"
                  : "bg-gray-500"
                } px-3 py-1 rounded-full`}
            >
              {progress}
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-md transition"
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
  progress: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  editedAssignee: PropTypes.string,
};

export default TicketModal;
