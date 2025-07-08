import { useFormik } from "formik";
import { signupValidationSchema as validationSchema } from "../../utils/validations/authValidation";
import toastMessages from "../../utils/toastMessages";
import { auth } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const initialValues = {
  username: "",
  email: "",
  password: "",
};

const Signup = () => {
  const { signupError, signupSuccess } = toastMessages.auth;
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      const { email, password } = values;
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success(signupSuccess);
        navigate("/");
      } catch (error) {
        toast.error(signupError);
        console.error("Signup error:", error);
      }
    },
  });

  const { handleSubmit, handleChange, handleBlur, values, touched, errors } =
    formik;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200">
      <div className="w-full max-w-lg p-10 bg-white rounded-lg shadow-lg">
        <form onSubmit={handleSubmit}>
          <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
            Signup
          </h1>
          <div className="mb-4">
            <input
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              name="username"
              placeholder="Enter your username"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.username}
            />
            {touched.username && errors.username && (
              <div className="text-red-500 text-sm mt-1">{errors.username}</div>
            )}
          </div>

          <div className="mb-4">
            <input
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              name="email"
              placeholder="Enter your email"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.email}
            />
            {touched.email && errors.email && (
              <div className="text-red-500 text-sm mt-1">{errors.email}</div>
            )}
          </div>

          <div className="mb-4">
            <input
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
              name="password"
              placeholder="Enter your password"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.password}
            />
            {touched.password && errors.password && (
              <div className="text-red-500 text-sm mt-1">{errors.password}</div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200"
          >
            Signup
          </button>
        </form>

        <div className="mt-4">
          <div className="flex items-center justify-center w-full">
            <button
              onClick={() => {
                navigate("/");
              }}
              className="px-4 py-2 border flex gap-2 border-slate-200 rounded-lg text-slate-700 hover:shadow transition duration-150"
            >
              <span className="text-black">
                Already have an account?{" "}
                <span className="underline">Login</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
