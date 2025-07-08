import React, { useState, useEffect } from "react";

import { useFormik } from "formik";
import * as Yup from "yup";

import { auth } from "../firebase";

import Card from "../components/Card";
import Modal from "../components/Modal";
import Header from "../components/Header";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchTodos,
  addTodo,
  deleteTodo,
  updateTodo,
} from "../store/slices/todoSlice";

const initialValues = {
  title: "",
  description: "",
  isCompleted: false,
};

const Tasks = () => {
  const dispatch = useDispatch();
  const { todoList, email } = useSelector((state) => state.todos);

  const [userID, setUserID] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dragCardIndex, setDragCardIndex] = useState(null);

  const validationSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    description: Yup.string().required("Description is required"),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!userID) {
        console.error("User is not authenticated");
        return;
      }

      if (isEditing) {
        const taskId = todoList[editIndex]?.id;
        if (!taskId) {
          console.error("Missing Task ID for edit.");
          return;
        }

        dispatch(updateTodo({ id: taskId, updates: values }));
        setIsEditing(false);
        setEditIndex(null);
      } else {
        dispatch(addTodo(values));
      }

      setIsModalOpen(false);
      resetForm();
    },
  });

  const handleDelete = (index) => {
    const task = todoList[index];
    if (task?.id) {
      dispatch(deleteTodo(task.id));
    }
  };

  const handleNext = (index) => {
    const task = todoList[index];
    if (!task) return;
    let status = task.status;
    let currentStep = task.currentStep;

    if (status === "Todo") {
      status = "InProgress";
      currentStep = 1;
    } else if (status === "InProgress") {
      status = "Completed";
      currentStep = 2;
    }

    dispatch(updateTodo({ id: task.id, updates: { status, currentStep } }));
  };

  const handlePrevious = (index) => {
    const task = todoList[index];
    if (!task) return;

    let status = task.status;
    let currentStep = task.currentStep;

    if (status === "Completed") {
      status = "InProgress";
      currentStep = 1;
    } else if (status === "InProgress") {
      status = "Todo";
      currentStep = 0;
    }

    dispatch(updateTodo({ id: task.id, updates: { status, currentStep } }));
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
    const currentStep = status === "Todo" ? 0 : status === "InProgress" ? 1 : 2;

    dispatch(updateTodo({ id: task.id, updates: { status, currentStep } }));

    setDragCardIndex(null);
  };

  const handleInlineUpdate = (index, field, value) => {
    const task = todoList[index];
    if (!task?.id) return;

    dispatch(updateTodo({ id: task.id, updates: { [field]: value } }));
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserID(user.uid);
        setIsAuth(true);
      } else {
        setIsAuth(false);
      }
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
      <Header isAuth={isAuth} setIsAuth={setIsAuth} />
      <div className="flex items-center justify-center p-5">
        <h1 className="font-bold text-3xl">{`Welcome!, ${email}`}</h1>
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
