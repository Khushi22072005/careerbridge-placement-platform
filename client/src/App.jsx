import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import Profile from "./pages/Profile/Profile";
import TechnicalAssessment from "./pages/TechnicalAssessment";
import DashboardLayout from "./layouts/DashboardLayout";
import CareerRoadmap from "./pages/CareerRoadmap";
import AssessmentResult from "./pages/AssessmentResult";
import CareerAssessment from "./pages/CareerAssessment/CareerAssessment";
import ResumeBuilder from "./pages/ResumeBuilder";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import MockInterview from "./pages/MockInterview/MockInterview";
import Settings from "./pages/Settings";
import LearningHub from "./pages/LearningHub";
import CareerDevelopment from "./pages/CareerDevelopment";

function App() {
  return (
    <Routes>

      {/* =======================
          PUBLIC PAGES
      ======================= */}

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/interview"
        element={<MockInterview />}
      />

      <Route
        path="/career-roadmap"
        element={<CareerRoadmap />}
      />

      <Route
        path="/career-assessment"
        element={<CareerAssessment />}
      />

      <Route
        path="/assessment-result"
        element={<AssessmentResult />}
      />

      {/* =======================
          DASHBOARD PAGES
      ======================= */}

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
          path="/settings"
          element={<Settings />}
        />

        <Route
          path="/technical-assessment"
          element={<TechnicalAssessment />}
        />

        <Route
          path="/resume-builder"
          element={<ResumeBuilder />}
        />

        <Route
          path="/resume-analyzer"
          element={<ResumeAnalyzer />}
        />

        {/* Learning Hub */}
        <Route
          path="/learning-hub"
          element={<LearningHub />}
        />

        {/* Career Development */}
        <Route
          path="/career-development"
          element={<CareerDevelopment />}
        />

      </Route>

    </Routes>
  );
}

export default App;