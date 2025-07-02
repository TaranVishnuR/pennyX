import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";  
import Auth from "./pages/Auth";  // ✅ Unified Login & Signup
import Home from "./pages/Home";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import Savings from "./pages/Savings";
import Settings from "./pages/Settings";
import Navbar from "./components/Navbar";
import AddIncome from "./pages/AddIncome";
import AddExpense from "./pages/AddExpense";
import ScanBill from "./pages/ScanBill";
import CreateBudget from "./pages/CreateBudget";
import "./styles/GlobalStyles.css";  // ✅ Global styling
import "regenerator-runtime/runtime";  // ✅ Ensures async/await works properly

// ✅ Protected Route Wrapper
const ProtectedRoute = ({ element }) => {
    const { currentUser } = useAuth();
    return currentUser ? element : <Navigate to="/login" replace />;
};

function App() {
    const location = useLocation();
    const { currentUser } = useAuth();
    
    // ✅ Persist Dark Mode
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("darkMode") === "true";
    });

    // ✅ Apply Dark Mode on Load
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
        localStorage.setItem("darkMode", darkMode);
    }, [darkMode]);

    return (
        <div>
            {/* ✅ Show Navbar only if user is logged in */}
            {currentUser && !["/login", "/signup"].includes(location.pathname) && (
                <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
            )}

            <main>
                <Routes>
                    {/* 🔹 Authentication Routes (Single `Auth.jsx` for both Login & Signup) */}
                    <Route path="/login" element={<Auth isSignup={false} />} />
                    <Route path="/signup" element={<Auth isSignup={true} />} />

                    {/* 🔹 Protected Routes */}
                    <Route path="/home" element={<ProtectedRoute element={<Home />} />} />
                    <Route path="/transactions" element={<ProtectedRoute element={<Transactions />} />} />
                    <Route path="/reports" element={<ProtectedRoute element={<Reports />} />} />
                    <Route path="/savings" element={<ProtectedRoute element={<Savings />} />} />
                    <Route path="/settings" element={<ProtectedRoute element={<Settings darkMode={darkMode} setDarkMode={setDarkMode} />} />} />

                    {/* 🔹 Quick Access Pages */}
                    <Route path="/add-income" element={<ProtectedRoute element={<AddIncome />} />} />
                    <Route path="/add-expense" element={<ProtectedRoute element={<AddExpense />} />} />
                    <Route path="/scan-bill" element={<ProtectedRoute element={<ScanBill />} />} />
                    <Route path="/create-budget" element={<ProtectedRoute element={<CreateBudget />} />} />

                    {/* 🔹 Redirect unknown routes to Login */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
