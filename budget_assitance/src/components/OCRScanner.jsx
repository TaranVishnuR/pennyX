import { useState } from "react";
import Tesseract from "tesseract.js";
import { addTransaction } from "../firebaseConfig";
import { useAuth } from "../context/AuthContext";
import "../styles/OCRScanner.css";

const OCRScanner = ({ setTransactions }) => {
    const { currentUser } = useAuth();
    const [selectedImage, setSelectedImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [ocrText, setOcrText] = useState(""); // Extracted raw text
    const [extractedData, setExtractedData] = useState({
        date: "",
        amount: "",
        category: "Miscellaneous",
    });

    // 📂 Handle Image Upload
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedImage(URL.createObjectURL(file));
            setIsConfirmed(false);
            setOcrText("");
            setExtractedData({ date: "", amount: "", category: "Miscellaneous" });
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
                tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789₹.,/-$€",
            });

            setOcrText(text); // Store full extracted text
            extractFieldsFromText(text);
        } catch (error) {
            console.error("OCR Error:", error);
        }

        setIsProcessing(false);
    };

    // 🧠 **Extract Key Fields from OCR Text**
    const extractFieldsFromText = (text) => {
        console.log("Extracted OCR Text:", text);

        // ✅ **Extract Date (Multiple Formats Supported)**
        const dateMatch = text.match(
            /\b(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{4}[\/-]\d{1,2}[\/-]\d{1,2})\b/
        );
        const date = dateMatch ? dateMatch[0] : "Unknown Date";

        // ✅ **Extract Amount (Handles ₹, $, €, INR, USD, etc.)**
        const amountMatch = text.match(/(?:₹|\$|€)?\s?(\d{1,7}(?:\.\d{1,2})?)/);
        const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;

        // ✅ **Extract Category Based on Keywords**
        let category = "Miscellaneous"; // Default Category
        const lowerText = text.toLowerCase();
        if (/grocery|supermarket|provision|mart|store/.test(lowerText)) {
            category = "Groceries";
        } else if (/restaurant|food|cafe|dining|coffee/.test(lowerText)) {
            category = "Food & Dining";
        } else if (/rent|lease|housing|flat/.test(lowerText)) {
            category = "Rent";
        } else if (/electricity|water bill|gas|utilities/.test(lowerText)) {
            category = "Utilities";
        } else if (/medicine|hospital|pharmacy|doctor/.test(lowerText)) {
            category = "Medical";
        } else if (/clothing|fashion|shopping|apparel/.test(lowerText)) {
            category = "Shopping";
        } else if (/petrol|transport|fuel|metro|taxi/.test(lowerText)) {
            category = "Transport";
        }

        setExtractedData({ date, amount, category });
    };

    // ✅ Save Expense to Firestore
    const handleSaveExpense = async () => {
        if (extractedData.amount > 0 && currentUser) {
            await addTransaction(
                currentUser.uid,
                "expense",
                extractedData.category, // Title as category name
                extractedData.amount,
                extractedData.date // ✅ Ensure correct date format
            );

            // 🔥 Immediately Update State
            setTransactions((prev) => [
                { type: "expense", title: extractedData.category, ...extractedData, timestamp: new Date() },
                ...prev,
            ]);

            // Reset after saving
            setSelectedImage(null);
            setIsConfirmed(false);
        }
    };

    // ❌ Remove Image & Reset Fields
    const handleCancel = () => {
        setSelectedImage(null);
        setOcrText("");
        setExtractedData({ date: "", amount: "", category: "Miscellaneous" });
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
                                    <h3>Extracted Data</h3>
                                    <p><strong>Date:</strong> <input type="text" value={extractedData.date} onChange={(e) => setExtractedData({ ...extractedData, date: e.target.value })} /></p>
                                    <p><strong>Amount (₹):</strong> <input type="number" value={extractedData.amount} onChange={(e) => setExtractedData({ ...extractedData, amount: e.target.value })} /></p>
                                    <p><strong>Category:</strong>
                                        <select value={extractedData.category} onChange={(e) => setExtractedData({ ...extractedData, category: e.target.value })}>
                                            <option value="Groceries">Groceries</option>
                                            <option value="Food & Dining">Food & Dining</option>
                                            <option value="Rent">Rent</option>
                                            <option value="Utilities">Utilities</option>
                                            <option value="Medical">Medical</option>
                                            <option value="Shopping">Shopping</option>
                                            <option value="Transport">Transport</option>
                                            <option value="Miscellaneous">Miscellaneous</option>
                                        </select>
                                    </p>
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

export default OCRScanner;
