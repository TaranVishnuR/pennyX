import { useState } from "react";
import { auth, signInWithGoogle } from "../firebaseConfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css"; // Import styles

const Auth = ({ isSignup }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    // 🔹 Handle Form Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isSignup) {
                if (password !== confirmPassword) {
                    setError("⚠️ Passwords do not match!");
                    return;
                }
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            navigate("/home"); // Redirect on success
        } catch (err) {
            setError(`⚠️ ${err.message}`);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h2 className="auth-title">{isSignup ? "Sign Up" : "Login"}</h2>
                <p className="auth-subtitle">{isSignup ? "Create your account" : "Welcome back!"}</p>
                {error && <p className="error">{error}</p>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Gmail</label>
                        <input
                            type="email"
                            placeholder="Enter your Gmail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Enter your Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* 🔹 Show Re-enter Password for Signup Only */}
                    {isSignup && (
                        <div className="input-group">
                            <label>Re-enter Password</label>
                            <input
                                type="password"
                                placeholder="Confirm your Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <button className="auth-btn" type="submit">
                        {isSignup ? "Sign Up" : "Login"}
                    </button>
                </form>

                <div className="divider">
                    <span></span>
                    <p>or</p>
                    <span></span>
                </div>

                <button className="google-btn" onClick={signInWithGoogle}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/0/09/IOS_Google_icon.png" alt="Google Logo" />
                    Continue with Google
                </button>

                <p className="auth-text">
                    {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
                    <a href={isSignup ? "/login" : "/signup"} className="toggle-auth">
                        {isSignup ? "Login" : "Sign Up"}
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Auth;
