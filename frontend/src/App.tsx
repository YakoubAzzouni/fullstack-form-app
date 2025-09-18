
import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Profile from "./pages/Profile";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
      <Routes>
        <Route
          path="/"
          element={isLoggedIn ? <Navigate to="/profile" /> : <Navigate to="/signin" />}
        />
        <Route path="/signup" element={<Signup onLogin={handleLogin} />} />
        <Route path="/signin" element={<Login onLogin={handleLogin} />} />
        <Route path="/profile" element={isLoggedIn ? <Profile onLogout={handleLogout} /> : <Navigate to="/signin" />} />
      </Routes>
  );
}

export default App;
