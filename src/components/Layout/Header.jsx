import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import toastMessages from "../../utils/toastMessages";

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
    <header className="bg-[#eeeaf3] border-purple-200 shadow-sm px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center sticky top-0 z-50 w-full">
      <div className="flex items-center space-x-3">
        <h1 className="text-xl sm:text-2xl font-semibold text-purple-900">
          Task Management
        </h1>
      </div>
      <button
        onClick={handleAuthClick}
        aria-label={isAuthenticated ? "Logout" : "Login"}
        className={`transition-all duration-200 ease-in-out px-4 sm:px-5 py-2 rounded-full text-sm font-medium shadow-sm ${isAuthenticated
          ? "bg-red-600 text-white hover:bg-red-700"
          : "bg-purple-600 text-white hover:bg-purple-700"
          }`}
      >
        {isAuthenticated ? "Logout" : "Login"}
      </button>
    </header>
  );
};

export default Header;
