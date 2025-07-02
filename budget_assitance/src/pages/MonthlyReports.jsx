import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebaseConfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import Charts from "../components/Charts"; 
import "../styles/MonthlyReports.css";

const MonthlyReports = () => {
    const { currentUser } = useAuth();
    const [expenses, setExpenses] = useState([]);

    useEffect(() => {
        if (!currentUser) return;

        // Fetch expenses from Firestore for the logged-in user
        const q = query(collection(db, "transactions"), where("userId", "==", currentUser.uid), where("type", "==", "expense"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const expensesData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setExpenses(expensesData);
        });

        return () => unsubscribe();
    }, [currentUser]);

    return (
        <div className="monthly-report">
            <h1>Monthly Expense Reports</h1>
            {expenses.length === 0 ? (
                <p>No expense data available.</p>
            ) : (
                <Charts expenses={expenses} /> 
            )}
        </div>
    );
};

export default MonthlyReports;
