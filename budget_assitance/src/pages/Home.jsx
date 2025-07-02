import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "../styles/Home.css";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";

const Home = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);

    // ✅ Budget State - Stored in localStorage for persistence
    const [budget, setBudget] = useState(() => localStorage.getItem("budget") || "");
    const [budgetConfirmed, setBudgetConfirmed] = useState(() => localStorage.getItem("budgetConfirmed") === "true");

    // ✅ Fetch transactions when user logs in
    useEffect(() => {
        if (!currentUser) return;

        const q = query(
            collection(db, "transactions"),
            where("userId", "==", currentUser.uid),
            orderBy("timestamp", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTransactions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: formatDate(doc.data().timestamp?.seconds) 
            }));
            setTransactions(fetchedTransactions);
        });

        return () => unsubscribe();
    }, [currentUser]);

    // ✅ Save budget & confirmation status in localStorage
    useEffect(() => localStorage.setItem("budget", budget), [budget]);
    useEffect(() => localStorage.setItem("budgetConfirmed", budgetConfirmed), [budgetConfirmed]);

    // ✅ Format Firestore Timestamp
    const formatDate = (timestamp) => {
        if (!timestamp) return "Unknown Date";
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
    };

    // ✅ Calculate total income & expenses
    const totalIncome = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0);

    // ✅ Budget Progress Bar Calculation
    const budgetValue = Number(budget) || 0;
    const budgetPercentage = budgetValue > 0 ? Math.min(((totalExpenses / budgetValue) * 100).toFixed(1), 100) : 0;

    // ✅ Progress bar color logic
    const getProgressColor = () => {
        if (budgetPercentage === 0) return "#ddd"; 
        if (budgetPercentage < 50) return "#28a745"; 
        if (budgetPercentage < 75) return "#ffc107"; 
        return "#dc3545"; 
    };

    // ✅ Categories & Chart Data
    const categories = ["Groceries", "Rent", "Utilities", "Entertainment", "Shopping", "Others"];
    const categoryExpenses = categories.map(cat =>
        transactions.filter(t => t.category === cat && t.type === "expense")
            .reduce((sum, t) => sum + Number(t.amount), 0)
    );

    const spendingData = {
        labels: categories,
        datasets: [{
            label: "Expenses (₹)",
            data: categoryExpenses,
            backgroundColor: ["#ff416c", "#007bff", "#ffc107", "#28a745", "#8e44ad", "#6c757d"]
        }]
    };

    // ✅ Allow Editing Budget
    const handleEditBudget = () => {
        setBudgetConfirmed(false);
    };

    return (
        <div className="home-container">
            <div className="main-content">
                {/* 📌 Recent Income & Expenses */}
                <div className="recent-section">
                    <div className="recent-income">
                        <h2>Recent Income</h2>
                        {transactions.filter(t => t.type === "income").length === 0 ? (
                            <p>No income transactions yet.</p>
                        ) : (
                            <ul>
                                {transactions.filter(t => t.type === "income").slice(0, 5).map((inc) => (
                                    <li key={inc.id}>{inc.category} - ₹{inc.amount} on {inc.date}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="recent-expenses">
                        <h2>Recent Expenses</h2>
                        {transactions.filter(t => t.type === "expense").length === 0 ? (
                            <p>No expense transactions yet.</p>
                        ) : (
                            <ul>
                                {transactions.filter(t => t.type === "expense").slice(0, 5).map((exp) => (
                                    <li key={exp.id}>{exp.category} - ₹{exp.amount} on {exp.date}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* 📉 Budget & Spending */}
                <div className="bottom-section">
                    <div className="budget-goal">
                        <h2>Monthly Budget</h2>
                        <input
                            type="number"
                            placeholder="Enter Budget (₹)"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            disabled={budgetConfirmed}
                        />
                        {!budgetConfirmed ? (
                            <button className="confirm-btn" onClick={() => setBudgetConfirmed(true)}>
                                Confirm Budget
                            </button>
                        ) : (
                            <button className="edit-btn" onClick={handleEditBudget}>
                                Edit Budget
                            </button>
                        )}
                        <p>Budget Progress:</p>
                        <div className="budget-progress">
                            <div 
                                className="progress-bar" 
                                style={{ width: `${budgetPercentage}%`, backgroundColor: getProgressColor(), height: "15px", borderRadius: "5px" }}
                            ></div>
                        </div>
                        <p className="budget-text">
                            {budgetPercentage}% of Budget Used
                        </p>
                    </div>

                    <div className="spending-analysis">
                        <h2>Spending Analysis</h2>
                        <div className="chart-container">
                            <Bar data={spendingData} />
                        </div>
                    </div>
                </div>

                {/* 🔹 Quick Access */}
                <div className="quick-access">
                    <h3>Quick Access</h3>
                    <button className="quick-btn" onClick={() => navigate("/add-income")}>Add Income</button>
                    <button className="quick-btn" onClick={() => navigate("/add-expense")}>Add Expense</button>
                    
                    <button className="quick-btn" onClick={() => navigate("/savings")}>Savings</button> 
                </div>
            </div>
        </div>
    );
};

export default Home;
