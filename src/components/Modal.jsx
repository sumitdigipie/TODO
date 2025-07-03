import React from "react";

const Modal = ({
  isOpen,
  onClose,
  onSubmit,
  values,
  handleChange,
  isEditing,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
        <div className="flex justify-center items-center mb-4 font-bold">
          <h2>Add TODO</h2>
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

export default Modal;
