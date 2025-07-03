import { useEffect, useState } from "react";
import "./App.css";
import Card from "./components/Card";
import { useFormik } from "formik";
import * as Yup from "yup";
import Modal from "./components/Modal";

const initialValues = {
  title: "",
  description: "",
  isCompleted: false,
};

function App() {
  const [data, setData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [dragCardIndex, setDragCardIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const validationSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    description: Yup.string().required("Description is required"),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      const newItem = { ...values, status: "Todo", currentStep: 0 };

      if (isEditing) {
        const updatedData = [...data];
        updatedData[editIndex] = newItem;
        setData(updatedData);
        setIsEditing(false);
        setEditIndex(null);
      } else {
        setData([...data, newItem]);
      }
      setIsModalOpen(false);
      resetForm();
    },
  });

  const handleDelete = (indexToDelete) => {
    const updatedData = data.filter((_, index) => index !== indexToDelete);
    setData(updatedData);

    if (isEditing && indexToDelete === editIndex) {
      formik.resetForm();
      setIsEditing(false);
      setEditIndex(null);
    }
  };

  const handleNext = (index) => {
    setData((prevData) => {
      const updatedData = [...prevData];
      const currentItem = updatedData[index];

      if (currentItem.status === "Todo") {
        currentItem.status = "InProgress";
        currentItem.currentStep = 1;
      } else if (currentItem.status === "InProgress") {
        currentItem.status = "Completed";
        currentItem.currentStep = 2;
      }

      return updatedData;
    });
  };

  const handlePrevious = (index) => {
    setData((prevData) => {
      const updatedData = [...prevData];
      const currentItem = updatedData[index];

      if (currentItem.status === "Completed") {
        currentItem.status = "InProgress";
        currentItem.currentStep = 1;
      } else if (currentItem.status === "InProgress") {
        currentItem.status = "Todo";
        currentItem.currentStep = 0;
      }

      return updatedData;
    });
  };

  const handleDragStart = (index) => {
    setDragCardIndex(index);
  };

  const allowDrop = (e) => {
    e.preventDefault();
  };

  const handleDrop = (status) => {
    if (dragCardIndex === null) return;

    setData((prevData) => {
      const updatedData = [...prevData];
      updatedData[dragCardIndex].status = status;

      if (status === "Todo") {
        updatedData[dragCardIndex].currentStep = 0;
      } else if (status === "InProgress") {
        updatedData[dragCardIndex].currentStep = 1;
      } else if (status === "Completed") {
        updatedData[dragCardIndex].currentStep = 2;
      }

      return updatedData;
    });

    setDragCardIndex(null);
  };

  const handleInlineUpdate = (index, field, value) => {
    setData((prevData) => {
      const updated = [...prevData];
      updated[index][field] = value;
      return updated;
    });
  };

  const { handleChange, handleSubmit, values } = formik;

  useEffect(() => {
    const storedTodos = localStorage.getItem("data");
    if (storedTodos) {
      setData(JSON.parse(storedTodos));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("data", JSON.stringify(data));
  }, [data]);

  const todoTasks = data.filter((item) => item.status === "Todo");
  const inProgressTasks = data.filter((item) => item.status === "InProgress");
  const completedTasks = data.filter((item) => item.status === "Completed");

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
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
}

export default App;
