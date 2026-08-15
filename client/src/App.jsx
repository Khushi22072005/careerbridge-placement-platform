import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import Profile from "./pages/Profile/Profile";
import TechnicalAssessment from "./pages/TechnicalAssessment";
import DashboardLayout from "./layouts/DashboardLayout";
import CareerAssessment from "./pages/CareerAssessment";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route
        path="/career-assessment"
        element={<CareerAssessment />}
      />

      <Route element={<DashboardLayout />}>
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/technical-assessment"
          element={<TechnicalAssessment />}
        />
      </Route>
    </Routes>
  );
}

export default App;
