import { BookCheck, SquarePen, Trash2 } from "lucide-react";
import PropTypes from "prop-types";

const Card = ({
  title,
  description,
  handleEdit,
  handleDelete,
  handleTaskProgress,
  isCompleted,
}) => {
  return (
    <div
      className={`border bg-gray-200 rounded-md p-4 ${
        isCompleted ? "border-green-500 bg-green-100" : "border-gray-300"
      }
`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p>{description}</p>
        </div>
        {isCompleted ? <BookCheck color="#349400" /> : null}
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleEdit}
            aria-label="Edit"
            className="p-2 rounded hover:bg-gray-300"
          >
            <SquarePen />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            aria-label="Delete"
            className="p-2 rounded hover:bg-gray-300"
          >
            <Trash2 />
          </button>
        </div>
        <button
          onClick={handleTaskProgress}
          type="button"
          className="px-4 py-1 bg-black text-white rounded"
        >
          {isCompleted ? "Incomplete" : "Complete"}
        </button>
      </div>
    </div>
  );
};

Card.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  handleDelete: PropTypes.func,
  handleEdit: PropTypes.func,
  handleTaskProgress: PropTypes.func,
};

export default Card;
