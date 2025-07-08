// src/App.js
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Tasks from "./pages/Tasks";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import AuthWrapper from "./components/AuthWrapper";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/tasks"
          element={
            <AuthWrapper>
              <Tasks />
            </AuthWrapper>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
