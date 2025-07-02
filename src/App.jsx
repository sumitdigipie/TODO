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
      if (isEditing) {
        const updatedData = [...data];
        updatedData[editIndex] = values;
        setData(updatedData);
        setIsEditing(false);
        setEditIndex(null);
      } else {
        setData([...data, values]);
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

  const handleTaskProgress = (index) => {
    const updatedData = [...data];
    updatedData[index].isCompleted = !updatedData[index].isCompleted;
    setData(updatedData);
  };

  const { handleChange, handleBlur, handleSubmit, values } = formik;

  useEffect(() => {
    const storedTodos = localStorage.getItem("data");
    console.log("storedTodos", storedTodos);
    if (storedTodos) {
      setData(JSON.parse(storedTodos));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("data", JSON.stringify(data));
  }, [data]);

  console.log("data", data);

  return (
    <div className="flex p-6 gap-10">
      <form onSubmit={handleSubmit} className="w-1/2 space-y-4">
        <input
          className="w-full p-3 border border-gray-500"
          type="text"
          name="title"
          placeholder="Enter title of post"
          onChange={handleChange}
          onBlur={handleBlur}
          value={values.title}
        />
        <textarea
          className="w-full p-3 border border-gray-500"
          name="description"
          placeholder="Enter description of post"
          onChange={handleChange}
          onBlur={handleBlur}
          value={values.description}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {isEditing ? "Update" : "Submit"}
        </button>
      </form>

      <div className="w-1/2 space-y-4">
        {data.map((item, index) => (
          <Card
            isCompleted={item.isCompleted}
            key={index}
            title={item.title}
            description={item.description}
            handleDelete={() => handleDelete(index)}
            handleEdit={() => handleEdit(item, index)}
            handleTaskProgress={() => handleTaskProgress(index)}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
