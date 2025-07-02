import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Tesseract from "tesseract.js"; // ✅ OCR Library
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition"; // ✅ Voice Recognition
import "../styles/AddExpense.css";

const AddExpense = () => {
    const { currentUser, setTransactions } = useAuth();
    const navigate = useNavigate();
    const [category, setCategory] = useState("Groceries");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // ✅ Default to Today
    const [error, setError] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [ocrText, setOcrText] = useState("");

    // ✅ Voice Recognition Hook
    const { transcript, listening, resetTranscript } = useSpeechRecognition();

    // ✅ Process Voice Input
    useEffect(() => {
        if (transcript) {
            console.log("🎤 Recognized Text:", transcript);
            
            let words = transcript.toLowerCase().split(" ");
            let detectedAmount = null;
            let detectedCategory = null;

            // ✅ Extract Amount (Find First Number)
            for (let word of words) {
                if (!isNaN(word)) {
                    detectedAmount = word;
                    break;
                }
            }

            // ✅ Extract Category from predefined list
            const possibleCategories = ["groceries", "rent", "utilities", "shopping", "medical", "food"];
            for (let word of words) {
                if (possibleCategories.includes(word)) {
                    detectedCategory = word.charAt(0).toUpperCase() + word.slice(1); // Capitalize first letter
                    break;
                }
            }

            // ✅ Update State if Valid
            if (detectedAmount) setAmount(detectedAmount);
            if (detectedCategory) setCategory(detectedCategory);

            resetTranscript(); // ✅ Clear transcript after use
        }
    }, [transcript, resetTranscript]);

    // ✅ Handle Image Upload for OCR
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedImage(URL.createObjectURL(file));
            setError("");
            processOCR(file);
        }
    };

    // 🔥 Run OCR using Tesseract.js
    const processOCR = async (image) => {
        setIsProcessing(true);
        try {
            const { data: { text } } = await Tesseract.recognize(image, "eng", {
                tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789₹.,/-"
            });

            setOcrText(text);
            extractExpenseData(text);
        } catch (error) {
            console.error("OCR Error:", error);
            setError("⚠️ Failed to extract text from receipt.");
        }
        setIsProcessing(false);
    };

    // 🧠 Extract Amount & Category from OCR Text
    const extractExpenseData = (text) => {
        console.log("Extracted OCR Text:", text);

        // Extract Amount (e.g., ₹500, 500, 1234.50)
        const amountMatch = text.match(/₹?\s?(\d{2,6}\.?\d{0,2})/);
        const extractedAmount = amountMatch ? parseFloat(amountMatch[1]) : "";

        // Extract category based on keywords in text
        let detectedCategory = "Miscellaneous";
        if (text.toLowerCase().includes("grocery") || text.toLowerCase().includes("supermarket")) {
            detectedCategory = "Groceries";
        } else if (text.toLowerCase().includes("restaurant") || text.toLowerCase().includes("food")) {
            detectedCategory = "Food & Dining";
        } else if (text.toLowerCase().includes("rent") || text.toLowerCase().includes("lease")) {
            detectedCategory = "Rent";
        } else if (text.toLowerCase().includes("electricity") || text.toLowerCase().includes("bill")) {
            detectedCategory = "Utilities";
        } else if (text.toLowerCase().includes("medicine") || text.toLowerCase().includes("pharmacy")) {
            detectedCategory = "Medical";
        }

        setAmount(extractedAmount);
        setCategory(detectedCategory);
    };

    // ✅ Handle Save Expense
    const handleSaveExpense = async () => {
        if (!currentUser) {
            setError("⚠️ User authentication failed.");
            return;
        }
        if (!amount || amount <= 0) {
            setError("⚠️ Invalid amount.");
            return;
        }
    
        try {
            const newTransaction = {
                category,
                amount: Number(amount),
                date,
                type: "expense",
                userId: currentUser.uid, // ✅ Ensure userId is correctly added
                timestamp: new Date(),
            };
    
            const docRef = await addDoc(collection(db, "transactions"), newTransaction);
            console.log("✅ Expense added with ID:", docRef.id);
    
            // ✅ Update Transactions List
            setTransactions(prev => [{ id: docRef.id, ...newTransaction }, ...prev]);
    
            navigate("/home");
    
        } catch (err) {
            console.error("❌ Error adding expense:", err);
            setError("⚠️ Failed to save expense.");
        }
    };
    
    return (
        <div className="expense-container">
            <h2>Add Expense</h2>
            {error && <p className="error">{error}</p>}

            {/* ✅ Receipt OCR Upload */}
            <div className="receipt-upload">
                <label className="scan-label">Scan Receipt</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} />
                {selectedImage && <img src={selectedImage} alt="Receipt Preview" className="receipt-preview" />}
            </div>

            <label>Category*</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Groceries">Groceries</option>
                <option value="Food & Dining">Food & Dining</option>
                <option value="Rent">Rent</option>
                <option value="Utilities">Utilities</option>
                <option value="Medical">Medical</option>
                <option value="Shopping">Shopping</option>
                <option value="Miscellaneous">Miscellaneous</option>
            </select>

            <label>Amount*</label>
            <div className="voice-input">
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                <button 
                    className="voice-btn" 
                    onClick={listening ? SpeechRecognition.stopListening : SpeechRecognition.startListening}
                >
                    🎙️ {listening ? "Listening..." : "Speak"}
                </button>
            </div>

            <label>Date*</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />

            <button className="save-btn" onClick={handleSaveExpense}>Save Expense</button>
        </div>
    );
};

export default AddExpense;
