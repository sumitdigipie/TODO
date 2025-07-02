import { SquarePen, Trash2 } from "lucide-react";
import PropTypes, { func } from "prop-types";

const Card = ({ title, description, handleEdit, handleDelete }) => {
  return (
    <div className="border bg-gray-200 rounded-md p-4">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p>{description}</p>
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleEdit}
          aria-label="Edit"
          className="p-2 rounded hover:bg-gray-300"
        >
          <SquarePen />
        </button>
        <button
          onClick={handleDelete}
          aria-label="Delete"
          className="p-2 rounded hover:bg-gray-300"
        >
          <Trash2 />
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
};

export default Card;
