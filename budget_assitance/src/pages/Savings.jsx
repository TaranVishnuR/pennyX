import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebaseConfig";
import { collection, addDoc, query, where, onSnapshot } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import Chatbot from "../components/Chatbot";
import "../styles/Savings.css";

const Savings = () => {
    const { currentUser } = useAuth();
    const [savings, setSavings] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [loading, setLoading] = useState(true);
    const [totalSavings, setTotalSavings] = useState(0);

    // ✅ Fetch Transactions & Savings in Real-time
    useEffect(() => {
        if (!currentUser) return;

        // 🔥 Fetch Transactions
        const transactionsQuery = query(collection(db, "transactions"), where("userId", "==", currentUser.uid));
        const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
            const transactionData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setTransactions(transactionData);
        });

        // 🔥 Fetch Savings
        const savingsQuery = query(collection(db, "savings"), where("userId", "==", currentUser.uid));
        const unsubscribeSavings = onSnapshot(savingsQuery, (snapshot) => {
            const savingsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setSavings(savingsData);
            setLoading(false);
        });

        return () => {
            unsubscribeTransactions();
            unsubscribeSavings();
        };
    }, [currentUser]);

    // ✅ Calculate Total Income, Expenses, and Budget
    useEffect(() => {
        if (!currentUser) return;

        const totalIncome = transactions
            .filter((t) => t.type === "income")
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const totalExpenses = transactions
            .filter((t) => t.type === "expense")
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const totalBudget = transactions
            .filter((t) => t.type === "budget")
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const savingsAmount = savings.reduce((sum, s) => sum + Number(s.amount), 0);

        setTotalSavings(totalIncome - totalExpenses - totalBudget + savingsAmount);
    }, [transactions, savings]);

    // ✅ Handle Adding Savings (Live Update)
    const addSavings = async () => {
        if (!amount || !category) {
            alert("⚠️ Please enter a valid amount and category.");
            return;
        }

        if (!currentUser) {
            alert("⚠️ User not logged in.");
            return;
        }

        try {
            await addDoc(collection(db, "savings"), {
                userId: currentUser.uid, 
                amount: Number(amount),
                category,
                timestamp: new Date()
            });

            setAmount("");
            setCategory("");
        } catch (error) {
            console.error("❌ Error Adding Savings:", error);
        }
    };

    // ✅ Prepare Savings & Expenses Data for Chart with Full Year Visualization
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Create a base object with all months set to 0
    const savingsByMonth = months.reduce((acc, month) => ({ ...acc, [month]: 0 }), {});
    const expensesByMonth = months.reduce((acc, month) => ({ ...acc, [month]: 0 }), {});

    // Populate the data with actual values
    savings.forEach((txn) => {
        if (txn.timestamp?.seconds) {
            const month = new Date(txn.timestamp.seconds * 1000).toLocaleString("default", { month: "short" });
            savingsByMonth[month] += Number(txn.amount);
        }
    });

    transactions.forEach((txn) => {
        if (txn.type === "expense" && txn.timestamp?.seconds) {
            const month = new Date(txn.timestamp.seconds * 1000).toLocaleString("default", { month: "short" });
            expensesByMonth[month] += Number(txn.amount);
        }
    });

    // ✅ Format Data for Chart with All Months
    const chartData = months.map((month) => ({
        month,
        Savings: savingsByMonth[month] || 0,
        Expenses: expensesByMonth[month] || 0,
    }));

    return (
        <div className="savings-container">
            {/* ✅ Total Savings Section */}
            <div className="total-savings">
                <h2> Total Savings</h2>
                <p>₹{totalSavings}</p>
            </div>

            {/* ✅ Add Savings Form */}
            <div className="add-savings">
                <h2>Add Savings</h2>
                <input
                    type="number"
                    placeholder="Enter amount (₹)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Enter category (e.g., Emergency, Investment)"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                />
                <button onClick={addSavings}>Add Savings</button>
            </div>

            {/* ✅ Savings vs Expenses Chart (Full Year) */}
            <div className="savings-chart">
                <h2> Monthly Savings vs Expenses</h2>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <ResponsiveContainer width="95%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Savings" fill="#28a745" name="Savings" />
                            <Bar dataKey="Expenses" fill="#ff4b2b" name="Expenses" />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* ✅ AI Chatbot for Financial Advice */}
            <div className="chatbot-container">
                <h2>💬 AI Financial Advisor</h2>
                <Chatbot />
            </div>
        </div>
    );
};

export default Savings;
