import { getAuth, signOut } from "firebase/auth";
import react, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import toastMessages from "../../utils/toastMessages";
import { useSelector } from "react-redux";

const Header = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const { logout } = toastMessages.auth;

  const isAuthenticated = localStorage.getItem("token");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { currentUserData, isLoading } = useSelector(
    (state) => state.users
  );

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        localStorage.removeItem("token");
        toast.success(logout);
        navigate("/");
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-[#eeeaf3] border-purple-200 shadow-sm px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center sticky top-0 z-50 w-full">
      <div className="flex items-center space-x-3">
        <h1 className="text-xl sm:text-2xl font-semibold text-purple-900">
          Task Management
        </h1>
      </div>

      {isAuthenticated ? (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="w-9 h-9 rounded-full bg-sky-600 text-white flex items-center justify-center font-semibold text-xs uppercase shadow-md"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span className="text-[12px] font-bold">
                {currentUserData?.firstName[0].toUpperCase()}{currentUserData?.lastName[0].toUpperCase()}
              </span>
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>

      ) : (
        <button
          onClick={() => navigate("/")}
          aria-label="Login"
          className="transition-all duration-200 ease-in-out px-4 sm:px-5 py-2 rounded-full text-sm font-medium shadow-sm bg-purple-600 text-white hover:bg-purple-700"
        >
          Login
        </button>
      )}
    </header>
  );
};

export default Header;