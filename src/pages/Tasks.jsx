import React, { useState, useEffect, useMemo } from "react";
import { taskValidationSchema as validationSchema } from "../utils/validations/taskValidation";
import { useFormik } from "formik";

import { auth } from "../firebase";

import Card from "../components/Card";
import Modal from "../components/Modal";
import Header from "../components/Header";
import toastMessages from "../utils/toastMessages";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchTodos,
  addTodo,
  deleteTodo,
  updateTodo,
} from "../store/slices/todoSlice";
import { toast } from "react-toastify";
import { fetchAllUsers } from "../store/slices/userSlice";

const initialValues = {
  title: "",
  description: "",
  isCompleted: false,
  assignedTo: "",
};

const ticketStages = ["Todo", "InProgress", "Completed"];

const Tasks = () => {
  const dispatch = useDispatch();
  const { todoList, isLoading } = useSelector((state) => state.todos);
  let { userList, currentUserData, isLoading: isUsersLoading } = useSelector((state) => state.users);

  const {
    addSuccess,
    taskIdMissing,
    deleteSuccess,
    deleteError,
    updateSuccess,
    updateError,
  } = toastMessages.todos;

  const [userID, setUserID] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dragCardIndex, setDragCardIndex] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!userID) {
        console.error("User is not authenticated");
        toast.error("You must be logged in to perform this action.");
        return;
      }

      try {
        if (isEditing) {
          const taskId = todoList[editIndex]?.id;
          if (!taskId) {
            console.error("Missing Task ID for edit.");
            toast.error(taskIdMissing);
            return;
          }

          await dispatch(updateTodo({ id: taskId, updates: values })).unwrap();
          toast.success(updateSuccess);
          setIsEditing(false);
          setEditIndex(null);
        } else {
          const assignedUser = userList.find((user) => user.uid === userID);
          if (assignedUser) {
            await dispatch(
              addTodo({ ...values, assignedTo: assignedUser.id })
            ).unwrap();
          } else {
            toast.error("Assigned user not found");
          }

          toast.success(addSuccess);
        }

        setIsModalOpen(false);
        resetForm();
      } catch (error) {
        console.error("Task operation failed:", error);
        toast.error("");
      }
    },
  });

  const handleDelete = async (index) => {
    const task = todoList[index];
    if (task?.id) {
      try {
        await dispatch(deleteTodo(task.id)).unwrap();
        toast.success(deleteSuccess);
      } catch {
        toast.error(deleteError);
      }
    }
  };
  const handleNext = (index) => {
    const task = todoList[index];
    if (!task) return;

    try {
      let { status } = task;

      const currentStep = ticketStages.indexOf(status);
      const nextStep = currentStep + 1;

      if (nextStep < ticketStages.length) {
        const status = ticketStages[nextStep];
        dispatch(
          updateTodo({
            id: task.id,
            updates: { status, currentStep: nextStep },
          })
        );
      }
    } catch (error) {
      console.error("Error in handleNext:", error);
    }
  };

  const handlePrevious = (index) => {
    const task = todoList[index];
    if (!task) return;

    try {
      let { status } = task;

      const currentStep = ticketStages.indexOf(status);
      const prevStep = currentStep - 1;

      if (prevStep >= 0) {
        const status = ticketStages[prevStep];
        dispatch(
          updateTodo({
            id: task.id,
            updates: { status, currentStep: prevStep },
          })
        );
      }
    } catch (error) {
      console.error("Error in handlePrevious:", error);
    }
  };

  const handleDragStart = (index) => {
    setDragCardIndex(index);
  };

  const allowDrop = (e) => {
    e.preventDefault();
  };

  const handleDrop = (status) => {
    if (dragCardIndex === null) return;

    const task = todoList[dragCardIndex];
    if (!task) return;

    try {
      const currentStep = ticketStages.indexOf(status);
      dispatch(updateTodo({ id: task.id, updates: { status, currentStep } }));
      setDragCardIndex(null);
    } catch (error) {
      console.error("Error in handleDrop:", error);
    }
  };

  const handleInlineUpdate = (index, field, value) => {
    const task = todoList[index];
    if (!task?.id) return;

    try {
      dispatch(updateTodo({ id: task.id, updates: { [field]: value } }));
      toast.success(updateSuccess);
    } catch (error) {
      console.error("Error in handleInlineUpdate:", error);
      toast.error(updateError);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserID(user.uid);
      }
      setAuthLoading(false);
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

  const filteredTodos =
    filter !== "All"
      ? todoList.filter((item) => item.assignedTo === filter)
      : todoList;

  const tasksByStatus = ticketStages.reduce((acc, status) => {
    acc[status] = filteredTodos.filter((item) => item.status === status);
    return acc;
  }, {});

  const { handleChange, handleSubmit, values } = formik;

  return (
    <div className="min-h-screen bg-[	#F8FAFC]">
      <Header />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 px-4 py-6">
        <div className="text-center sm:text-left flex-1">
          {authLoading || isLoading ? (
            <div className="loader">Loading...</div>
          ) : (
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              Welcome, {currentUserData?.firstName} {currentUserData?.lastName}
              <span className="bg-blue-100 text-blue-700 text-xs sm:text-sm font-medium px-3 py-1 rounded-full mt-2.5">
                {currentUserData?.role || "User"}
              </span>
            </h1>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded transition"
          >
            + Create Task
          </button>
          <div className="relative w-full sm:w-64">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              disabled={isUsersLoading}
              className="appearance-none w-full text-sm px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:bg-gray-100 disabled:text-gray-500"
            >
              {isUsersLoading ? (
                <option>Loading users...</option>
              ) : userList.length === 0 ? (
                <option>No users available</option>
              ) : (
                <>
                  <option value="All">All</option>
                  {userList.map((user) => (
                    <option key={user.id} value={user.uid}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))}
                </>
              )}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 pb-10">
        {ticketStages.map((status) => {
          const containerBg =
            status === "Todo"
              ? "bg-slate-100 border-slate-200"
              : status === "InProgress"
                ? "bg-yellow-50 border-yellow-200"
                : status === "Completed"
                  ? "bg-green-50 border-green-200"
                  : "";

          const headerColor =
            status === "Todo"
              ? "text-slate-800"
              : status === "InProgress"
                ? "text-yellow-800"
                : "text-green-800";

          return (
            <div
              key={status}
              onDragOver={allowDrop}
              onDrop={() => handleDrop(status)}
              className={`rounded-lg p-4 shadow-sm transition hover:shadow-md border ${containerBg}`}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-lg font-semibold ${headerColor}`}>
                  {status}
                  <span className="ml-2 text-sm text-gray-500 bg-gray-300 px-2 py-1 rounded-md">
                    {tasksByStatus[status].length}
                  </span>
                </h2>
              </div>


              <div className="space-y-4 ]">
                {tasksByStatus[status].map((item) => {
                  const assignedUser = userList.find((user) => user.id === item.assignedTo);
                  console.log('item :>> ', item?.status);
                  return (
                    <Card
                      key={item.id}
                      title={item.title}
                      progress={item?.status}
                      description={item.description}
                      handleDisable={item.currentStep}
                      AssignUserId={assignedUser?.uid}
                      AssignUser={
                        assignedUser
                          ? `${assignedUser.firstName} ${assignedUser.lastName}`
                          : "Not Assigned"
                      }
                      onUpdate={(field, value) =>
                        handleInlineUpdate(todoList.indexOf(item), field, value)
                      }
                      handleDelete={() => handleDelete(todoList.indexOf(item))}
                      handleNext={() => handleNext(todoList.indexOf(item))}
                      handlePrevious={() => handlePrevious(todoList.indexOf(item))}
                      onDragStart={() => handleDragStart(todoList.indexOf(item))}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        values={values}
        handleChange={handleChange}
        isEditing={isEditing}
      />
    </div>

  );
};

export default Tasks;
