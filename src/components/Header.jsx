import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import toastMessages from "../utils/toastMessages";
import { toast } from "react-toastify";

const Header = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const { logout } = toastMessages.auth;

  const isAuthenticated = localStorage.getItem("token");

  const handleAuthClick = () => {
    if (isAuthenticated) {
      signOut(auth)
        .then(() => {
          localStorage.removeItem("token");
          toast.success(logout);
          navigate("/");
        })
        .catch((error) => {
          console.error("Error signing out:", error);
        });
    } else {
      navigate("/");
    }
  };

  return (
    <header className="bg-gray-100 flex justify-between items-center px-6 py-4 shadow">
      <h1 className="text-2xl font-bold text-gray-800">Todo App</h1>
      <button
        onClick={handleAuthClick}
        className={`${
          isAuthenticated ? "bg-red-400 text-black" : "bg-blue-600 text-white"
        } px-4 py-2 rounded hover:bg-blue-700`}
      >
        {isAuthenticated ? "Logout" : "Login"}
      </button>
    </header>
  );
};

export default Header;
