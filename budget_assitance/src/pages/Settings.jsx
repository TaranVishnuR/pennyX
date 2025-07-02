import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/Settings.css";

const Settings = () => {
    const { currentUser } = useAuth();
    const [username, setUsername] = useState(currentUser?.displayName || "");
    const [password, setPassword] = useState("");
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [budgetAlerts, setBudgetAlerts] = useState(true);

    const handleUsernameChange = () => {
        alert(`✅ Username updated to: ${username}`);
    };

    const handlePasswordChange = () => {
        alert("✅ Password updated successfully!");
    };

    const handleReferral = () => {
        alert("✅ Referral link copied!");
    };

    const handleDeleteAccount = () => {
        alert("⚠️ Account deleted!");
    };

    return (
        <div className="settings-container">
            <h2 className="settings-title"> Settings</h2>

            {/* 🔹 Profile & Security Section in Parallel Containers */}
            <div className="settings-grid">
                <div className="settings-section">
                    <h3>Profile</h3>
                    <label>Username</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                    <button className="primary-btn" onClick={handleUsernameChange}>Update Username</button>

                    <label>Email</label>
                    <input type="text" value={currentUser?.email} disabled />
                </div>

                <div className="settings-section">
                    <h3>Security</h3>
                    <label>New Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button className="primary-btn" onClick={handlePasswordChange}>Change Password</button>
                </div>
            </div>

            {/* 🔹 Preferences Section */}
            <h3 className="section-title">Preferences</h3>
            <div className="settings-section">
                <div className="toggle-container">
                    <label>Dark Mode</label>
                    <label className="switch">
                        <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                        <span className="slider round"></span>
                    </label>
                </div>
                <div className="toggle-container">
                    <label>Notifications</label>
                    <label className="switch">
                        <input type="checkbox" checked={notifications} onChange={() => setNotifications(!notifications)} />
                        <span className="slider round"></span>
                    </label>
                </div>
                <div className="toggle-container">
                    <label>Budget Alerts</label>
                    <label className="switch">
                        <input type="checkbox" checked={budgetAlerts} onChange={() => setBudgetAlerts(!budgetAlerts)} />
                        <span className="slider round"></span>
                    </label>
                </div>
            </div>

            {/* 🔹 Referral Section */}
            <h3 className="section-title">Referral Program</h3>
            <div className="settings-section">
                <p>Invite friends and earn rewards! 🎉</p>
                <button className="green-btn" onClick={handleReferral}>Invite Friends</button>
            </div>

            {/* 🔹 Support Section */}
            <h3 className="section-title">Support & Help</h3>
            <div className="settings-section support-container">
                <button className="primary-btn">FAQs & Help Center</button>
                <button className="primary-btn">Contact Support</button>
                <button className="primary-btn">Submit Feedback</button>
            </div>

            {/* 🔹 Delete Account Button (Same style as Logout button) */}
            <div className="delete-account-container">
                <button className="delete-account-btn" onClick={handleDeleteAccount}>
                    Delete Account
                </button>
            </div>
        </div>
    );
};

export default Settings;
