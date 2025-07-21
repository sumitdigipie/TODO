import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { taskValidationSchema as validationSchema } from "../utils/validations/taskValidation";
import { auth } from "../firebase";

import Modal from "../components/modals/Modal";
import toastMessages from "../utils/toastMessages";

import {
  fetchTodos,
  addTodo,
  updateTodo,
} from "../store/slices/todoSlice";
import { fetchAllUsers } from "../store/slices/userSlice";
import { addSection, fetchSections, updateSectionOrder } from "../store/slices/sectionsSlice";
import Loader from "../components/common/Loader";
import TaskColumn from "../components/TaskColumn";

const initialValues = {
  title: "",
  description: "",
  isCompleted: false,
  assignedTo: "",
};

const Tasks = () => {

  const dispatch = useDispatch();
  const sections = useSelector((state) => state.sections);
  const { todoList, isLoading } = useSelector((state) => state.todos);
  const { userList, currentUserData, isLoading: isUsersLoading } = useSelector(
    (state) => state.users
  );

  const {
    addSuccess,
    taskIdMissing,
    updateSuccess,
  } = toastMessages.todos;

  const [userID, setUserID] = useState(null);
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


  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!userID) {
        toast.error("You must be logged in to perform this action.");
        return;
      }

      const sectionId = sections?.sections?.[0]?.id;
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

  const handleSectionDragStart = (index) => {
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

  useEffect(() => {
    if (userID) {
      dispatch(fetchTodos());
    }
  }, [userID, dispatch]);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchSections());
  }, [sections.sections.length, todoList]);

  const isPageLoading = isLoading && isUsersLoading;

  return (
    isPageLoading ?
      (<Loader />) :
      (
        <div className="bg-[#F8FAFC] min-h-[calc(100vh-4rem)] pb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 py-6 gap-6">
            <div className="flex gap-2 items-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {currentUserData?.firstName} {currentUserData?.lastName}
              </h1>
              <div className="text-sm text-gray-600 flex items-center mt-1.5">
                <span className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
                  {currentUserData?.role || "User"}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm transition text-sm w-full sm:w-auto"
              >
                + Create Task
              </button>

              <div className="relative w-full sm:w-64">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="appearance-none w-full text-sm px-3 py-2.5 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:bg-gray-100 disabled:text-gray-500"
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
          <div className="flex flex-col overflow-x-auto px-4">
            <div className="flex space-x-6 pb-12"
              onDrop={() => handleSectionDrop(sectionDropIndex)}
              onDragOver={allowDrop}
            >
              <TaskColumn
                filter={filter}
                sections={sections}
                handleSectionDragStart={handleSectionDragStart}
                setSectionDropIndex={setSectionDropIndex}
                setDragCardIndex={setDragCardIndex}
                dragCardIndex={dragCardIndex}
                setDragType={setDragType}
                dragType={dragType}
              />
              <div className="flex flex-col top-0 justify-start items-center border-gray-300 min-w-[300px] w-full md:w-[320px] lg:w-[360px] bg-gray-50 transition-all duration-200 p-4">
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
                    Add Section
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
      )
  );
};

export default Tasks;