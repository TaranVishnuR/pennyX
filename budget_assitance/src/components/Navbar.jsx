import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Navbar.css";
import { FaBars } from "react-icons/fa";

const Navbar = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    // ✅ Hide Navbar on Login & Signup Pages
    useEffect(() => {
        if (!currentUser || location.pathname === "/signup" || location.pathname === "/login") {
            return setMenuOpen(false);
        }
    }, [location.pathname, currentUser]);

    // ✅ Redirect to Home
    const handleHomeNavigation = () => {
        navigate("/home");
    };

    // ✅ If not logged in, hide the navbar
    if (!currentUser) return null;

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Left Side - Logo */}
                <button className="logo" onClick={handleHomeNavigation}>
                    <span>PennyX</span>
                </button>

                {/* Middle - Navigation Links */}
                <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
                    <li><Link to="/home">Home</Link></li>
                    <li><Link to="/transactions">Transactions</Link></li>
                    <li><Link to="/reports">Reports</Link></li>
                    <li><Link to="/savings">Savings</Link></li>
                    <li><Link to="/settings">Settings</Link></li>
                </ul>

                {/* Right Side - Logout Button */}
                <button onClick={logout} className="logout-btn">Logout</button>

                {/* Mobile Menu Toggle */}
                <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                    <FaBars />
                </button>
            </div>

            {/* Close menu if user clicks outside */}
            {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)}></div>}
        </nav>
    );
};

export default Navbar;
