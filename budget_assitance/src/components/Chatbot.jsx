import { useState, useEffect } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import "../styles/Chatbot.css";

const Chatbot = ({ transactions }) => {
    const [messages, setMessages] = useState([
        { sender: "bot", text: "Hello! How can I assist you with your savings today?" },
    ]);
    const [userInput, setUserInput] = useState("");
    const [isListening, setIsListening] = useState(false);

    // ✅ Speech Recognition Hook
    const { transcript, listening, resetTranscript } = useSpeechRecognition();

    // ✅ Automatically Process Voice Input
    useEffect(() => {
        if (!listening && transcript) {
            handleSendMessage(transcript);
            resetTranscript(); // ✅ Clear transcript after processing
        }
    }, [listening]);

    // ✅ Function to generate chatbot replies
    const getBotResponse = (input) => {
        const text = input.toLowerCase();

        if (text.includes("how to save money")) return "Start by tracking your expenses and setting a budget.";
        if (text.includes("best way to save")) return "Invest in SIPs or set up a recurring deposit.";
        if (text.includes("suggest a budget")) return getBudgetInsights();
        if (text.includes("how much have i saved")) return getSavingsSummary();
        if (text.includes("investment tips")) return "Diversify into stocks, gold, and FDs.";

        return "I'm not sure about that, but I can help with savings and budgeting!";
    };

    // ✅ Get User’s Savings Summary
    const getSavingsSummary = () => {
        if (!transactions || transactions.length === 0) return "No data available.";

        const totalSavings = transactions
            .filter(txn => txn.type === "income")
            .reduce((sum, txn) => sum + txn.amount, 0);

        const totalExpenses = transactions
            .filter(txn => txn.type === "expense")
            .reduce((sum, txn) => sum + txn.amount, 0);

        return `You have saved ₹${totalSavings - totalExpenses}. Your total expenses are ₹${totalExpenses}.`;
    };

    // ✅ Suggest Budget Based on Expenses
    const getBudgetInsights = () => {
        if (!transactions || transactions.length === 0) return "No data available.";

        const totalSavings = transactions.filter(txn => txn.type === "income").reduce((sum, txn) => sum + txn.amount, 0);
        const totalExpenses = transactions.filter(txn => txn.type === "expense").reduce((sum, txn) => sum + txn.amount, 0);

        const savingsPercentage = ((totalSavings - totalExpenses) / totalSavings) * 100;
        return `Your current savings rate is ${savingsPercentage.toFixed(2)}%. Aim to save at least 30% of your income.`;
    };

    // ✅ Handle Sending User Message
    const handleSendMessage = (input = userInput) => {
        if (!input.trim()) return;

        const userMessage = { sender: "user", text: input };
        const botMessage = { sender: "bot", text: getBotResponse(input) };

        setMessages([...messages, userMessage, botMessage]);
        setUserInput("");
    };

    return (
        <div className="chatbot">
            <div className="chatbox">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender}`}>
                        <span className="chat-text">{msg.text}</span>
                        <span className="chat-timestamp">{new Date().toLocaleTimeString()}</span>
                    </div>
                ))}
            </div>

            {/* ✅ Quick Action Buttons */}
            <div className="quick-buttons">
                <button onClick={() => handleSendMessage("How much have I saved?")}> Check Savings</button>
                <button onClick={() => handleSendMessage("Suggest a budget")}> Get Budget Insights</button>
                <button onClick={() => handleSendMessage("Investment tips")}> Investment Tips</button>
            </div>

            {/* ✅ User Input */}
            <div className="chat-input">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Ask something..."
                />
                <button onClick={() => handleSendMessage()}>Send</button>

                {/* ✅ Voice Input */}
               
            </div>
        </div>
    );
};

export default Chatbot;
