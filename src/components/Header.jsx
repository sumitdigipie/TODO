import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import toastMessages from "../utils/toastMessages";

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
    <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center space-x-3">
        <h1 className="text-2xl font-semibold text-gray-800">Todo App</h1>
      </div>

      <button
        onClick={handleAuthClick}
        className={`transition-all duration-200 ease-in-out px-5 py-2 rounded-full text-sm font-medium shadow-sm ${isAuthenticated
          ? "bg-red-500 text-white hover:bg-red-600"
          : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
      >
        {isAuthenticated ? "Logout" : "Login"}
      </button>
    </header>
  );
};

export default Header;
