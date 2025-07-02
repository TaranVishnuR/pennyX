import { useState, useEffect } from "react";

const RecurringExpenses = ({ addExpense }) => {
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("Rent");
    const [frequency, setFrequency] = useState("Monthly");
    const [nextDue, setNextDue] = useState("");

    useEffect(() => {
        const today = new Date();
        today.setDate(today.getDate() + 30); // Default next payment in 30 days
        setNextDue(today.toISOString().split("T")[0]); // Format YYYY-MM-DD
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title || !amount || !nextDue) return;

        addExpense({
            title,
            amount: parseFloat(amount),
            category,
            date: nextDue,
            recurring: frequency
        });

        setTitle("");
        setAmount("");
        setNextDue("");
    };

    return (
        <form onSubmit={handleSubmit} className="recurring-expense-form">
            <h2>Add Recurring Expense</h2>
            <input 
                type="text" 
                placeholder="Expense Title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
            />
            <input 
                type="number" 
                placeholder="Amount (₹)" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                required 
            />
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Rent">Rent</option>
                <option value="EMI">EMI</option>
                <option value="Subscriptions">Subscriptions</option>
                <option value="Utilities">Utilities</option>
            </select>
            <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                <option value="Monthly">Monthly</option>
                <option value="Weekly">Weekly</option>
                <option value="Yearly">Yearly</option>
            </select>
            <input 
                type="date" 
                value={nextDue} 
                onChange={(e) => setNextDue(e.target.value)} 
                required 
            />
            <button type="submit">Add Recurring Expense</button>
        </form>
    );
};

export default RecurringExpenses;
