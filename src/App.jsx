import { useEffect, useState } from "react";
import "./App.css";
import Card from "./components/Card";
import { useFormik } from "formik";
import * as Yup from "yup";

const initialValues = {
  title: "",
  description: "",
  isCompleted: false,
};

function App() {
  const [data, setData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const validationSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    description: Yup.string().required("Description is required"),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      const newItem = { ...values, status: "Todo" };

      if (isEditing) {
        const updatedData = [...data];
        updatedData[editIndex] = newItem;
        setData(updatedData);
        setIsEditing(false);
        setEditIndex(null);
      } else {
        setData([...data, newItem]);
      }
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

  const handleEdit = (item, index) => {
    setIsEditing(true);
    setEditIndex(index);
    formik.setValues({
      title: item?.title,
      description: item?.description,
      isCompleted: item?.isCompleted || false,
    });
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
  console.log("data", data);
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

  const { handleChange, handleBlur, handleSubmit, values } = formik;

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
      <div className="flex justify-center mb-10">
        <form onSubmit={handleSubmit} className="space-y-7 w-full max-w-xl">
          <input
            className="w-full p-3 border border-gray-500 rounded"
            type="text"
            name="title"
            placeholder="Enter title of post"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.title}
          />
          <textarea
            className="w-full p-3 border border-gray-500 rounded"
            name="description"
            placeholder="Enter description of post"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.description}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {isEditing ? "Update" : "Submit"}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border p-6 space-y-3">
          <h2 className="text-xl font-semibold mb-4 text-center">Todo</h2>
          {todoTasks.map((item, index) => (
            <Card
              key={index}
              title={item.title}
              handleDisable={item.currentStep}
              description={item.description}
              isCompleted={item.isCompleted}
              handleEdit={() => handleEdit(item, data.indexOf(item))}
              handleDelete={() => handleDelete(data.indexOf(item))}
              handleTaskProgress={() => toggleTaskCompletion(index)}
              handleNext={() => handleNext(data.indexOf(item))}
              handlePrevious={() => handlePrevious(data.indexOf(item))}
            />
          ))}
        </div>
        <div className="border p-6 space-y-3">
          <h2 className="text-xl font-semibold mb-4 text-center">
            In Progress
          </h2>
          {inProgressTasks.map((item, index) => (
            <Card
              key={index}
              handleDisable={item.currentStep}
              title={item.title}
              description={item.description}
              isCompleted={item.isCompleted}
              handleEdit={() => handleEdit(item, data.indexOf(item))}
              handleDelete={() => handleDelete(data.indexOf(item))}
              handleTaskProgress={() => toggleTaskCompletion(index)}
              handleNext={() => handleNext(data.indexOf(item))}
              handlePrevious={() => handlePrevious(data.indexOf(item))}
            />
          ))}
        </div>
        <div className="border p-6 space-y-3">
          <h2 className="text-xl font-semibold mb-4 text-center">Completed</h2>
          {completedTasks.map((item, index) => (
            <Card
              key={index}
              handleDisable={item.currentStep}
              title={item.title}
              description={item.description}
              isCompleted={item.isCompleted}
              handleEdit={() => handleEdit(item, data.indexOf(item))}
              handleDelete={() => handleDelete(data.indexOf(item))}
              handleTaskProgress={() => toggleTaskCompletion(index)}
              handleNext={() => handleNext(data.indexOf(item))}
              handlePrevious={() => handlePrevious(data.indexOf(item))}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
