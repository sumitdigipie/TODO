import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { taskValidationSchema as validationSchema } from "../utils/validations/taskValidation";
import { auth } from "../firebase";

import Modal from "../components/modals/Modal";
import toastMessages from "../utils/toastMessages";

import {
  addTodo,
  updateTodo,
} from "../store/slices/todoSlice";
import { addSection, updateSectionOrder } from "../store/slices/sectionsSlice";
import TaskColumn from "../components/TaskColumn";

const initialValues = {
  title: "",
  description: "",
  isCompleted: false,
  assignedTo: "",
};

const Tasks = ({ userID, setUserID, sections, todoList, currentUserData, userList }) => {

  const dispatch = useDispatch();

  const {
    addSuccess,
    taskIdMissing,
    updateSuccess,
  } = toastMessages.todos;

  const [editIndex, setEditIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dragSectionIndex, setDragSectionIndex] = useState(null)
  const [newSectionName, setNewSectionName] = useState("");
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [submitting, setSubmitting] = useState(false);
  const [sectionDropIndex, setSectionDropIndex] = useState(null)
  const [dragCardIndex, setDragCardIndex] = useState(null);
  const [dragType, setDragType] = useState(null);
  const [sectionId, setSectionId] = useState(null);


  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!userID) {
        toast.error("You must be logged in to perform this action.");
        return;
      }

      setSubmitting(true);
      try {
        if (isEditing) {
          const taskId = todoList[editIndex]?.id;
          if (!taskId) {
            toast.error(taskIdMissing);
            return;
          }
          await dispatch(updateTodo({ id: taskId, updates: values })).unwrap();
          toast.success(updateSuccess);
          setIsEditing(false);
          setEditIndex(null);
        } else {
          if (values.assignedTo) {
            await dispatch(
              addTodo({ ...values, assignedTo: values.assignedTo, sectionId: sectionId })
            ).unwrap();
            toast.success(addSuccess);
          } else {
            toast.error("Assigned user not found");
          }
        }
        setIsModalOpen(false);
        resetForm();
      } catch (error) {
        toast.error("Failed to process task");
        console.error(error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const {
    handleChange,
    handleSubmit,
    values,
  } = formik;

  const handleAddSection = async () => {
    if (!newSectionName.trim()) {
      toast.error("Section name cannot be empty");
      return;
    }
    try {
      await dispatch(addSection({ status: newSectionName })).unwrap();
      toast.success("Section added");
      setNewSectionName("");
      setIsSectionModalOpen(false);
    } catch (error) {
      toast.error("Failed to add section");
    }
  };

  const handleSectionDragStart = (index, e) => {
    e.stopPropagation();
    if (dragCardIndex !== null) return;
    if (dragType === "card") return;
    setDragType("section");

    setDragSectionIndex(index);
  };

  const handleSectionDrop = async (dropIndex) => {

    if (dragCardIndex !== null || dragSectionIndex === null || dragSectionIndex === dropIndex) return;

    const updatedSections = [...sections.sections];
    const draggedItem = updatedSections.splice(dragSectionIndex, 1)[0];
    updatedSections.splice(dropIndex, 0, draggedItem);
    const reordered = updatedSections.map((section, index) => {
      return {
        ...section,
        order: index,
      }
    });

    await dispatch(updateSectionOrder(reordered));
    setDragCardIndex(null);
    setDragSectionIndex(null);
    setDragType(null);
  };

  const allowDrop = (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserID(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start md:items-center md:justify-between gap-4 px-4 py-6">
        <div className="flex gap-1 sm:flex-row sm:items-center">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">
            Welcome, {currentUserData?.firstName} {currentUserData?.lastName}
          </h1>
          <span className="inline-block bg-blue-500/30 text-blue-800 text-[11px] font-bold px-3 py-1 rounded-full mt-1 ml-1 sm:mt-2 md:mt-2 md:ml-2 backdrop-blur-sm shadow-sm">
            {currentUserData?.role || "User"}
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="appearance-none w-full text-sm px-4 py-2.5 border border-purple-300 rounded-lg bg-white text-purple-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-gray-100 disabled:text-gray-400 transition"
            >
              <option value="All">All Users</option>
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
      </div>


      <div className="overflow-x-auto px-2 sm:px-4">
        <div
          className="flex gap-4 sm:gap-6 pb-12 w-max min-w-full"
          onDragOver={allowDrop}
        >
          <TaskColumn
            filter={filter}
            sections={sections}
            setIsModalOpen={setIsModalOpen}
            handleSectionDragStart={handleSectionDragStart}
            setSectionDropIndex={setSectionDropIndex}
            setDragCardIndex={setDragCardIndex}
            dragCardIndex={dragCardIndex}
            setDragType={setDragType}
            handleSectionDrop={handleSectionDrop}
            dragType={dragType}
            setSectionId={setSectionId}
          />
          <div className="flex flex-col rounded-lg top-0 justify-start items-center border-gray-300 min-w-[300px] w-full md:w-[320px] lg:w-[360px]  transition-all duration-200 p-2 max-h-max">
            {isSectionModalOpen ? (
              <div className="flex flex-col gap-3 w-full">
                <input
                  type="text"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  placeholder="Section name"
                  className="border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={handleAddSection}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsSectionModalOpen(false);
                      setNewSectionName("");
                    }}
                    className="text-gray-600 hover:text-gray-800 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsSectionModalOpen(true)}
                className="flex items-center justify-center w-full gap-2 bg-[#5e6470] hover:bg-[#4b4f59] text-white py-2 px-4 rounded-lg shadow transition"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Add section
              </button>
            )}
          </div>

        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        values={values}
        handleChange={handleChange}
        isEditing={isEditing}
        submitting={submitting}
      />
    </div >
  );
};

export default Tasks;