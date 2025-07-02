import { useState } from "react";
import Tesseract from "tesseract.js";
import { addTransaction } from "../firebaseConfig"; // ✅ Import Fixed
import { useAuth } from "../context/AuthContext";
import "../styles/OCRScanner.css";

const ReceiptScanner = () => {
    const { currentUser, transactions, setTransactions } = useAuth();
    const [selectedImage, setSelectedImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [ocrText, setOcrText] = useState("");
    const [extractedData, setExtractedData] = useState({
        date: new Date().toISOString().split("T")[0], // ✅ Default to Today
        amount: "",
        category: "Groceries",
    });
    const [error, setError] = useState("");

    // 📂 Handle Image Upload
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedImage(URL.createObjectURL(file));
            setIsConfirmed(false);
            setOcrText("");
            setExtractedData({ date: new Date().toISOString().split("T")[0], amount: "", category: "Groceries" });
            setError(""); // Clear errors
        }
    };

    // ✅ Confirm Image Before OCR
    const handleConfirmImage = () => {
        setIsConfirmed(true);
        processOCR();
    };

    // 🔥 Run OCR using Tesseract.js
    const processOCR = async () => {
        if (!selectedImage) return;
        setIsProcessing(true);

        try {
            const { data: { text } } = await Tesseract.recognize(selectedImage, "eng", {
                logger: (m) => console.log(m),
                tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789₹.,/-",
            });

            setOcrText(text); // Store full extracted text
            extractFieldsFromText(text);
        } catch (error) {
            console.error("OCR Error:", error);
            setError("⚠️ OCR extraction failed. Please try again.");
        }

        setIsProcessing(false);
    };

    // 🧠 Extract Key Fields from OCR Text
    const extractFieldsFromText = (text) => {
        console.log("Extracted OCR Text:", text);

        // Extract date (Common formats like DD/MM/YYYY or MM/DD/YYYY)
        const dateMatch = text.match(/\b(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})\b/);
        const date = dateMatch ? dateMatch[0] : new Date().toISOString().split("T")[0]; // Default to today

        // Extract amount (₹500, 500, 1234.50)
        const amountMatch = text.match(/₹?\s?(\d{2,6}\.?\d{0,2})/);
        const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;

        // Extract category based on keywords
        let category = "Miscellaneous"; // Default
        const categoryMap = {
            "grocery": "Groceries",
            "supermarket": "Groceries",
            "restaurant": "Food",
            "food": "Food",
            "rent": "Rent",
            "lease": "Rent",
            "electricity": "Utilities",
            "bill": "Utilities",
            "medicine": "Medical",
            "pharmacy": "Medical"
        };

        Object.keys(categoryMap).forEach(keyword => {
            if (text.toLowerCase().includes(keyword)) {
                category = categoryMap[keyword];
            }
        });

        setExtractedData({ date, amount, category });
    };

    // ✅ Save Expense to Firestore
    const handleSaveExpense = async () => {
        if (!currentUser) {
            setError("⚠️ User authentication failed.");
            return;
        }

        if (!extractedData.amount || extractedData.amount <= 0) {
            setError("⚠️ Invalid amount.");
            return;
        }

        try {
            const transactionId = await addTransaction(
                currentUser.uid,
                "expense",
                extractedData.category,
                extractedData.amount,
                extractedData.date
            );

            console.log(`✅ Transaction saved: ₹${extractedData.amount} - ${extractedData.category}`);

            // ✅ Fix: Live UI Update Before Firestore Sync
            setTransactions(prev => [
                { id: transactionId, type: "expense", ...extractedData, timestamp: new Date() },
                ...prev,
            ]);

            setSelectedImage(null);
            setIsConfirmed(false);
            setOcrText("");
            setExtractedData({ date: new Date().toISOString().split("T")[0], amount: "", category: "Groceries" });
            setError(""); // Clear errors
        } catch (err) {
            console.error("❌ Failed to save expense:", err);
            setError("⚠️ Failed to save expense.");
        }
    };

    // ❌ Remove Image & Reset Fields
    const handleCancel = () => {
        setSelectedImage(null);
        setOcrText("");
        setExtractedData({ date: new Date().toISOString().split("T")[0], amount: "", category: "Groceries" });
        setIsConfirmed(false);
    };

    return (
        <div className="ocr-container">
            <h2>Scan Receipt</h2>
            <input type="file" accept="image/*" onChange={handleImageUpload} />

            {selectedImage && (
                <div className="preview-section">
                    <img src={selectedImage} alt="Scanned Receipt" className="scanned-image" />

                    {!isConfirmed ? (
                        <>
                            <p>Confirm this receipt before scanning.</p>
                            <button onClick={handleConfirmImage} className="ok-btn">OK</button>
                            <button onClick={handleCancel} className="cancel-btn">Cancel</button>
                        </>
                    ) : (
                        <>
                            {isProcessing ? (
                                <p>Extracting text... Please wait</p>
                            ) : (
                                <div className="preview-content">
                                    <p><strong>Amount:</strong> ₹{extractedData.amount}</p>
                                    <p><strong>Date:</strong> {extractedData.date}</p>
                                    <p><strong>Category:</strong> {extractedData.category}</p>
                                    <button onClick={handleSaveExpense} className="save-btn">✅ Save Expense</button>
                                    <button onClick={handleCancel} className="cancel-btn">❌ Cancel</button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReceiptScanner;
