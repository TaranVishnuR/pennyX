import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "../styles/Transactions.css";
import { FaFileExcel, FaFilePdf } from "react-icons/fa"; // ✅ Icons for export buttons

const Transactions = () => {
    const { currentUser } = useAuth();
    const [incomeTransactions, setIncomeTransactions] = useState([]);
    const [expenseTransactions, setExpenseTransactions] = useState([]);
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpenses, setTotalExpenses] = useState(0);

    useEffect(() => {
        if (!currentUser) return;

        const q = query(collection(db, "transactions"), where("userId", "==", currentUser.uid), orderBy("timestamp", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const income = [];
            const expenses = [];
            let totalIncomeAmount = 0;
            let totalExpenseAmount = 0;

            snapshot.docs.forEach((doc) => {
                const data = { id: doc.id, ...doc.data() };
                // ✅ Convert date into a more readable format
                const dateObj = new Date(data.date);
                const formattedDate = dateObj.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

                data.date = formattedDate; // ✅ Assign the formatted date

                if (data.type === "income") {
                    income.push(data);
                    totalIncomeAmount += data.amount;
                } else {
                    expenses.push(data);
                    totalExpenseAmount += data.amount;
                }
            });

            setIncomeTransactions(income);
            setExpenseTransactions(expenses);
            setTotalIncome(totalIncomeAmount);
            setTotalExpenses(totalExpenseAmount);
        });

        return () => unsubscribe();
    }, [currentUser]);

    // ✅ Export Transactions to Excel
    const exportToExcel = () => {
        const data = [...incomeTransactions, ...expenseTransactions];
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
        XLSX.writeFile(workbook, "Transactions.xlsx");
    };

    // ✅ Export Transactions to PDF
    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text("Transactions Report", 14, 10);
        const tableData = [...incomeTransactions, ...expenseTransactions].map(({ amount, category, date, type }) => [
            type.toUpperCase(),
            `₹${amount}`,
            category,
            date,
        ]);
        doc.autoTable({
            head: [["Type", "Amount", "Category", "Date"]],
            body: tableData,
        });
        doc.save("Transactions.pdf");
    };

    return (
        <div className="transactions-page">
            <h2 className="transactions-title"> Transactions</h2>

            <div className="export-buttons">
                <button className="export-btn excel-btn" onClick={exportToExcel}>
                    <FaFileExcel className="export-icon" /> Export to Excel
                </button>
                <button className="export-btn pdf-btn" onClick={exportToPDF}>
                    <FaFilePdf className="export-icon" /> Export to PDF
                </button>
            </div>

            {/* ✅ Display Total Income & Expenses */}
            <div className="totals-container">
                <p className="total-income">Total Income: ₹{totalIncome}</p>
                <p className="total-expenses">Total Expenses: ₹{totalExpenses}</p>
            </div>

            <div className="transactions-container">
                {/* Income Transactions */}
                <div className="transactions-box income-box">
                    <h3>Income Transactions</h3>
                    {incomeTransactions.length === 0 ? (
                        <p>No income transactions found.</p>
                    ) : (
                        <ul>
                            {incomeTransactions.map((transaction) => (
                                <li key={transaction.id}>
                                    ₹{transaction.amount} ({transaction.category}) on {transaction.date}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Expense Transactions */}
                <div className="transactions-box expense-box">
                    <h3>Expense Transactions</h3>
                    {expenseTransactions.length === 0 ? (
                        <p>No expense transactions found.</p>
                    ) : (
                        <ul>
                            {expenseTransactions.map((transaction) => (
                                <li key={transaction.id}>
                                    ₹{transaction.amount} ({transaction.category}) on {transaction.date}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Transactions;
