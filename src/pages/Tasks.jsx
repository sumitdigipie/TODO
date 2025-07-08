import React, { useState, useEffect } from "react";
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

const initialValues = {
  title: "",
  description: "",
  isCompleted: false,
};

const Tasks = () => {
  const dispatch = useDispatch();
  const { todoList, email, isLoading } = useSelector((state) => state.todos);
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
          await dispatch(addTodo(values)).unwrap();
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
      let { status, currentStep } = task;

      if (status === "Todo") {
        status = "InProgress";
        currentStep = 1;
      } else if (status === "InProgress") {
        status = "Completed";
        currentStep = 2;
      }
      dispatch(updateTodo({ id: task.id, updates: { status, currentStep } }));
    } catch (error) {
      console.error("Error in handleNext:", error);
    }
  };

  const handlePrevious = (index) => {
    const task = todoList[index];
    if (!task) return;

    try {
      let { status, currentStep } = task;

      if (status === "Completed") {
        status = "InProgress";
        currentStep = 1;
      } else if (status === "InProgress") {
        status = "Todo";
        currentStep = 0;
      }

      dispatch(updateTodo({ id: task.id, updates: { status, currentStep } }));
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
      const currentStep =
        status === "Todo" ? 0 : status === "InProgress" ? 1 : 2;

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

  const todoTasks = todoList.filter((item) => item.status === "Todo");
  const inProgressTasks = todoList.filter(
    (item) => item.status === "InProgress"
  );
  const completedTasks = todoList.filter((item) => item.status === "Completed");

  const { handleChange, handleSubmit, values } = formik;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex items-center justify-center p-5">
        {authLoading || isLoading ? (
          <div className="loader">Loading...</div>
        ) : (
          <h1 className="font-bold text-3xl">{`Welcome!, ${email}`}</h1>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        <div
          onDragOver={allowDrop}
          onDrop={() => handleDrop("Todo")}
          className="border p-6 space-y-3 rounded"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold mb-4 text-center">Todo</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-black px-4 py-2 rounded text-cyan-50 mr-3"
            >
              Add
            </button>
          </div>
          {todoTasks.map((item, index) => (
            <Card
              key={index}
              title={item.title}
              handleDisable={item.currentStep}
              description={item.description}
              isCompleted={item.isCompleted}
              onUpdate={(field, value) =>
                handleInlineUpdate(todoList.indexOf(item), field, value)
              }
              handleDelete={() => handleDelete(todoList.indexOf(item))}
              handleTaskProgress={() => {}}
              handleNext={() => handleNext(todoList.indexOf(item))}
              handlePrevious={() => handlePrevious(todoList.indexOf(item))}
              onDragStart={() => handleDragStart(todoList.indexOf(item))}
            />
          ))}
        </div>
        <div
          onDragOver={allowDrop}
          onDrop={() => handleDrop("InProgress")}
          className="border p-6 space-y-3 rounded"
        >
          <h2 className="text-xl font-semibold mb-4">In Progress</h2>
          {inProgressTasks.map((item, index) => (
            <Card
              key={index}
              title={item.title}
              handleDisable={item.currentStep}
              description={item.description}
              isCompleted={item.isCompleted}
              onUpdate={(field, value) =>
                handleInlineUpdate(todoList.indexOf(item), field, value)
              }
              handleDelete={() => handleDelete(todoList.indexOf(item))}
              handleTaskProgress={() => {}}
              handleNext={() => handleNext(todoList.indexOf(item))}
              handlePrevious={() => handlePrevious(todoList.indexOf(item))}
              onDragStart={() => handleDragStart(todoList.indexOf(item))}
            />
          ))}
        </div>

        <div
          onDragOver={allowDrop}
          onDrop={() => handleDrop("Completed")}
          className="border p-6 space-y-3 rounded"
        >
          <h2 className="text-xl font-semibold mb-4">Completed</h2>
          {completedTasks.map((item, index) => (
            <Card
              key={index}
              title={item.title}
              handleDisable={item.currentStep}
              description={item.description}
              isCompleted={item.isCompleted}
              onUpdate={(field, value) =>
                handleInlineUpdate(todoList.indexOf(item), field, value)
              }
              handleDelete={() => handleDelete(todoList.indexOf(item))}
              handleTaskProgress={() => {}}
              handleNext={() => handleNext(todoList.indexOf(item))}
              handlePrevious={() => handlePrevious(todoList.indexOf(item))}
              onDragStart={() => handleDragStart(todoList.indexOf(item))}
            />
          ))}
        </div>
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
