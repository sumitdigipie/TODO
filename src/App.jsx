import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

import Layout from "./components/Layout/Layout";
import PublicRoute from "./components/PublicRoute";
import PrivateRoute from "./components/PrivateRoute";
import Dashboard from "./pages/Dashboard";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route element={<PrivateRoute />}>
            <Route
              path="/tasks"
              element={<Dashboard />}
            />
          </Route>
          <Route element={<PublicRoute />}>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
