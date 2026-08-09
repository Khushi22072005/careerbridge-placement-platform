import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import Profile from "./pages/Profile/Profile";

import DashboardLayout from "./layouts/DashboardLayout";

function App() {
    return (
        <Routes>

            {/* =================================
                PUBLIC PAGES
            ================================= */}

            <Route path="/" element={<Home />} />

            <Route path="/login" element={<Login />} />

            <Route
                path="/register"
                element={<Register />}
            />

            <Route
                path="/forgot-password"
                element={<ForgotPassword />}
            />


            {/* =================================
                DASHBOARD LAYOUT
            ================================= */}

            <Route element={<DashboardLayout />}>

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                <Route
                    path="/profile"
                    element={<Profile />}
                />

            </Route>

        </Routes>
    );
}

export default App;

