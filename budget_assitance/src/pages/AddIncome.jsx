import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../styles/AddIncome.css";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

const AddIncome = () => {
    const { currentUser, setTransactions } = useAuth();
    const navigate = useNavigate();
    const [category, setCategory] = useState("Salary");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [error, setError] = useState("");

    // ✅ Voice Recognition Hook
    const { transcript, listening, resetTranscript } = useSpeechRecognition();

    useEffect(() => {
        if (transcript) {
            console.log("🎤 Recognized Text:", transcript);

            let words = transcript.toLowerCase().split(" ");
            let detectedAmount = null;
            let detectedCategory = null;

            // ✅ Extract Amount (Find First Number)
            for (let word of words) {
                const number = word.replace(/[^0-9]/g, ""); // Remove non-numeric characters
                if (number && !isNaN(number)) {
                    detectedAmount = number;
                    break;
                }
            }

            // ✅ Extract Category from predefined list
            const possibleCategories = ["salary", "freelance", "business", "investments", "others"];
            for (let word of words) {
                if (possibleCategories.includes(word)) {
                    detectedCategory = word.charAt(0).toUpperCase() + word.slice(1); // Capitalize first letter
                    break;
                }
            }

            // ✅ Update State Only If Values Are Detected
            if (detectedAmount) {
                setAmount(detectedAmount);
            }
            if (detectedCategory) {
                setCategory(detectedCategory);
            }

            SpeechRecognition.stopListening(); // ✅ Fixes AbortError
            resetTranscript();
        }
    }, [transcript, resetTranscript]);

    // ✅ Handle Save Income
    const handleSave = async () => {
        setError(""); // Clear previous errors

        // ✅ Check Authentication
        if (!currentUser || !currentUser.uid) {
            setError("⚠️ User authentication failed. Please log in again.");
            return;
        }

        // ✅ Validate Amount
        if (!amount || isNaN(amount) || amount <= 0) {
            setError("⚠️ Please enter a valid income amount.");
            return;
        }

        // ✅ Validate Date
        if (!date.trim()) {
            setError("⚠️ Please select a valid date.");
            return;
        }

        try {
            const newTransaction = {
                category,
                amount: Number(amount),
                date,
                type: "income",
                userId: currentUser.uid, // ✅ Ensure Firestore rules match this
                timestamp: new Date(),
            };

            const docRef = await addDoc(collection(db, "transactions"), newTransaction);
            console.log("✅ Income added with ID:", docRef.id);

            // ✅ Update state immediately (Ensures UI updates instantly)
            setTransactions(prev => [{ id: docRef.id, ...newTransaction }, ...prev]);

            navigate("/home");
        } catch (err) {
            console.error("❌ Error adding income:", err);
            setError("⚠️ Failed to save income. Please try again.");
        }
    };

    return (
        <div className="add-income-container">
            <h2>Add Income</h2>
            {error && <p className="error">{error}</p>}

            <label>Category*</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Salary">Salary</option>
                <option value="Freelance">Freelance</option>
                <option value="Business">Business</option>
                <option value="Investments">Investments</option>
                <option value="Others">Others</option>
            </select>

            <label>Amount*</label>
            <div className="voice-input">
                <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value.trim())} 
                    required 
                />
                <button 
                    className={`voice-btn ${listening ? "listening" : ""}`} 
                    onClick={listening ? SpeechRecognition.stopListening : SpeechRecognition.startListening}
                >
                    🎙️ {listening ? "Listening..." : "Speak"}
                </button>
            </div>

            <label>Date*</label>
            <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value.trim())} 
                required 
            />

            <button className="save-btn" onClick={handleSave}>Save</button>
        </div>
    );
};

export default AddIncome;
