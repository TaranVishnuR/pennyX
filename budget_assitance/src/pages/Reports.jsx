import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, Legend, PieChart, Pie, Cell
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebaseConfig";
import "../styles/Reports.css";

// Month names for readability
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const Reports = () => {
    const { currentUser } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState("All Months");
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        if (!currentUser) return;

        const q = query(
            collection(db, "transactions"),
            where("userId", "==", currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const transactionList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                month: new Date(doc.data().timestamp?.seconds * 1000).getMonth() + 1,
                year: new Date(doc.data().timestamp?.seconds * 1000).getFullYear()
            }));
            setTransactions(transactionList);
        });

        return () => unsubscribe();
    }, [currentUser]);

    // Filter transactions by selected month & year
    const filteredTransactions = transactions.filter(t =>
        (selectedMonth === "All Months" || t.month === parseInt(selectedMonth)) &&
        t.year === parseInt(selectedYear)
    );

    // Bar Chart Data - Income vs. Expenses
    const barChartData = monthNames.map((month, index) => {
        const monthlyIncome = filteredTransactions
            .filter(t => t.type === "income" && t.month === index + 1)
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const monthlyExpenses = filteredTransactions
            .filter(t => t.type === "expense" && t.month === index + 1)
            .reduce((sum, t) => sum + Number(t.amount), 0);

        return { month, Income: monthlyIncome, Expenses: monthlyExpenses };
    });

    // Pie Chart Data - Category-wise Expenses
    const categoryData = {};
    filteredTransactions.filter(t => t.type === "expense").forEach((t) => {
        if (!categoryData[t.category]) categoryData[t.category] = 0;
        categoryData[t.category] += Number(t.amount);
    });

    const pieChartData = Object.keys(categoryData).map(category => ({
        name: category,
        value: categoryData[category]
    }));

    const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#9C27B0"];

    return (
        <div className="reports-container">
            <h2 className="reports-title"> Reports & Analysis</h2>

            {/* Month & Year Filters */}
            <div className="filters">
                <select className="styled-dropdown" onChange={(e) => setSelectedMonth(e.target.value)} value={selectedMonth}>
                    <option value="All Months">All Months</option>
                    {monthNames.map((month, index) => (
                        <option key={index + 1} value={index + 1}>{month}</option>
                    ))}
                </select>

                <select className="styled-dropdown" onChange={(e) => setSelectedYear(e.target.value)} value={selectedYear}>
                    {[2023, 2024, 2025, 2026].map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>

            {/* Income vs. Expenses Bar Chart */}
            <div className="chart-box">
                <h3> Income vs Expenses</h3>
                <div className="bar-chart-container">
                    <ResponsiveContainer width="80%" height={300}>
                        <BarChart data={barChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Income" fill="#36A2EB" name="Income" />
                            <Bar dataKey="Expenses" fill="#FF6384" name="Expenses" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Category-wise Spending Pie Chart */}
            <div className="chart-box">
                <h3> Category-wise Spending</h3>
                <div className="pie-chart-container">
                    <ResponsiveContainer width="50%" height={300}>
                        <PieChart>
                            <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {pieChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Reports;
