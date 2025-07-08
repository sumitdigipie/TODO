import { useFormik } from "formik";
import { loginValidationSchema as validationSchema } from "../../utils/validations/authValidation";
import toastMessages from "../../utils/toastMessages";
import { auth } from "../../firebase";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const initialValues = {
  email: "",
  password: "",
};

const Login = () => {
  const navigate = useNavigate();
  const {
    loginSuccess,
    loginError,
    loginSuccessWithGoogle,
    loginErrorWithGoogle,
  } = toastMessages.auth;

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      const { email, password } = values;
      try {
        await signInWithEmailAndPassword(auth, email, password);
        localStorage.setItem("token", auth?.currentUser?.accessToken);
        toast.success(loginSuccess);
        navigate("/tasks");
      } catch (error) {
        console.error("error", error);
        toast.error(loginError);
      }
    },
  });
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      localStorage.setItem("token", user.accessToken);
      toast.success(loginSuccessWithGoogle);
      navigate("/tasks");
    } catch (error) {
      console.error("Google login error", error);
      toast.error(loginErrorWithGoogle);
    }
  };

  const { handleChange, handleSubmit, values, errors, touched, handleBlur } =
    formik;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200">
      <div className="w-full max-w-lg p-10 bg-white rounded-lg shadow-lg">
        <form onSubmit={handleSubmit}>
          <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
            Login
          </h1>
          <div className="mb-4">
            <input
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              name="email"
              placeholder="Enter your username"
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
            Login
          </button>

          <div className="mt-2 flex items-center justify-center">
            <span className=" text-center">
              Don't have account ?{" "}
              <span
                className="cursor-pointer text-blue-400"
                onClick={() => navigate("/signup")}
              >
                Signup
              </span>
            </span>
          </div>
        </form>

        <div className="mt-4">
          <div className="py-3 flex items-center text-sm text-gray-800 before:flex-1 before:border-t before:border-gray-200 before:me-6 after:flex-1 after:border-t after:border-gray-200 after:ms-6 dark:text-black dark:before:border-neutral-600 dark:after:border-neutral-600">
            Or
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-center w-full">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="px-4 py-2 border flex gap-2 border-slate-200 rounded-lg text-slate-700 hover:shadow transition duration-150"
            >
              <img
                className="w-6 h-6"
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                loading="lazy"
                alt="google logo"
              />
              <span className="text-black">Login with Google</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
