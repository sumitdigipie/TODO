import React from "react";
import { useState, useEffect } from "react";

import { useFormik } from "formik";
import * as Yup from "yup";
import { auth } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";

import { db } from "../firebase";

import Card from "../components/Card";
import Modal from "../components/Modal";
import Header from "../components/Header";

const initialValues = {
  title: "",
  description: "",
  isCompleted: false,
};

const Tasks = () => {
  const [data, setData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [dragCardIndex, setDragCardIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userID, setUserID] = useState(null);
  const [isAuth, setIsAuth] = useState(false);

  const validationSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    description: Yup.string().required("Description is required"),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      const userId = auth.currentUser.uid;
      if (!userId) {
        console.error("User is not authenticated");
        return;
      }

      if (isEditing) {
        const taskId = data[editIndex].id;

        if (!taskId) {
          console.error("Cannot update Firestore: Task ID is missing.");
          return;
        }
        const updatedData = [...data];
        updatedData[editIndex] = {
          ...updatedData[editIndex],
          ...values,
        };
        setData(updatedData);

        setIsEditing(false);
        setEditIndex(null);
      } else {
        const newItem = { ...values, status: "Todo", currentStep: 0 };

        try {
          const docRef = await addDoc(
            collection(db, "users", userId, "tasks"),
            newItem
          );
          setData((prev) => [...prev, { ...newItem, id: docRef.id }]);
        } catch (err) {
          console.error("Error adding task to Firestore:", err);
        }
      }

      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateTaskInFirestore = async (taskId, updatedFields) => {
    try {
      const taskRef = doc(db, "users", userID, "tasks", taskId);
      await updateDoc(taskRef, updatedFields);
    } catch (err) {
      console.error("Error updating task in Firestore:", err);
    }
  };
  const handleDelete = async (indexToDelete) => {
    const taskToDelete = data[indexToDelete];

    try {
      await deleteDoc(doc(db, "users", userID, "tasks", taskToDelete.id));
      const updatedData = data.filter((_, index) => index !== indexToDelete);
      setData(updatedData);
      if (isEditing && indexToDelete === editIndex) {
        formik.resetForm();
        setIsEditing(false);
        setEditIndex(null);
      }
    } catch (err) {
      console.error("Error deleting task from Firestore:", err);
    }
  };

  const handleNext = async (index) => {
    const updatedData = [...data];
    const task = updatedData[index];

    if (task.status === "Todo") {
      task.status = "InProgress";
      task.currentStep = 1;
    } else if (task.status === "InProgress") {
      task.status = "Completed";
      task.currentStep = 2;
    }

    setData(updatedData);
    await updateTaskInFirestore(task.id, {
      status: task.status,
      currentStep: task.currentStep,
    });
  };

  const handlePrevious = async (index) => {
    const updatedData = [...data];
    const task = updatedData[index];

    if (task.status === "Completed") {
      task.status = "InProgress";
      task.currentStep = 1;
    } else if (task.status === "InProgress") {
      task.status = "Todo";
      task.currentStep = 0;
    }

    setData(updatedData);
    await updateTaskInFirestore(task.id, {
      status: task.status,
      currentStep: task.currentStep,
    });
  };

  const handleDragStart = (index) => {
    setDragCardIndex(index);
  };

  const allowDrop = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (status) => {
    if (dragCardIndex === null) return;

    const updatedData = [...data];
    const task = updatedData[dragCardIndex];

    task.status = status;
    task.currentStep = status === "Todo" ? 0 : status === "InProgress" ? 1 : 2;

    setData(updatedData);
    await updateTaskInFirestore(task.id, {
      status: task.status,
      currentStep: task.currentStep,
    });

    setDragCardIndex(null);
  };

  const handleInlineUpdate = (index, field, value) => {
    const updatedData = [...data];
    updatedData[index][field] = value;
    setData(updatedData);

    updateTaskInFirestore(updatedData[index].id, {
      [field]: value,
    });
  };

  const fetchTasks = async () => {
    if (userID) {
      const querySnapshot = await getDocs(
        collection(db, "users", userID, "tasks")
      );
      const tasks = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setData(tasks);
    }
  };

  const { handleChange, handleSubmit, values } = formik;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserID(user?.uid);
        setUserEmail(user?.email);
        setIsAuth(true);
      } else {
        setIsAuth(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userID) {
      fetchTasks();
    }
  }, [userID]);

  const todoTasks = data.filter((item) => item.status === "Todo");
  const inProgressTasks = data.filter((item) => item.status === "InProgress");
  const completedTasks = data.filter((item) => item.status === "Completed");

  return (
    <div className="min-h-screen  bg-gray-100">
      <div>
        <Header isAuth={isAuth} setIsAuth={setIsAuth} />
      </div>
      <div className="flex items-center justify-center p-5">
        <h1 className="font-bold text-3xl">{`Welcome!, ${userEmail}`}</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 ">
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
                handleInlineUpdate(data.indexOf(item), field, value)
              }
              handleDelete={() => handleDelete(data.indexOf(item))}
              handleTaskProgress={() => toggleTaskCompletion(index)}
              handleNext={() => handleNext(data.indexOf(item))}
              handlePrevious={() => handlePrevious(data.indexOf(item))}
              onDragStart={() => handleDragStart(data.indexOf(item))}
            />
          ))}
        </div>
        <div
          onDragOver={allowDrop}
          onDrop={() => handleDrop("InProgress")}
          className="border p-6 space-y-7 rounded"
        >
          <h2 className="text-xl font-semibold mb-4">In Progress</h2>
          {inProgressTasks.map((item, index) => (
            <Card
              key={index}
              handleDisable={item.currentStep}
              title={item.title}
              description={item.description}
              isCompleted={item.isCompleted}
              onUpdate={(field, value) =>
                handleInlineUpdate(data.indexOf(item), field, value)
              }
              handleDelete={() => handleDelete(data.indexOf(item))}
              handleTaskProgress={() => toggleTaskCompletion(index)}
              handleNext={() => handleNext(data.indexOf(item))}
              handlePrevious={() => handlePrevious(data.indexOf(item))}
              onDragStart={() => handleDragStart(data.indexOf(item))}
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
              handleDisable={item.currentStep}
              title={item.title}
              description={item.description}
              isCompleted={item.isCompleted}
              onUpdate={(field, value) =>
                handleInlineUpdate(data.indexOf(item), field, value)
              }
              handleDelete={() => handleDelete(data.indexOf(item))}
              handleTaskProgress={() => toggleTaskCompletion(index)}
              handleNext={() => handleNext(data.indexOf(item))}
              handlePrevious={() => handlePrevious(data.indexOf(item))}
              onDragStart={() => handleDragStart(data.indexOf(item))}
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
