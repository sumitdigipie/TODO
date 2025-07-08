import { getAuth, signOut } from "firebase/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const auth = getAuth();
  const navigate = useNavigate();

  const isAuthenticated = localStorage.getItem("token");
  const [email, setEmail] = useState(auth?.currentUser?.email);

  const handleAuthClick = () => {
    if (isAuthenticated) {
      signOut(auth)
        .then(() => {
          setEmail(null);
          localStorage.removeItem("token");
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
