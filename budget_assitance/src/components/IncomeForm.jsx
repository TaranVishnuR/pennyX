import { useState } from "react";

const IncomeForm = ({ addIncome }) => {
    const [source, setSource] = useState("");
    const [amount, setAmount] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!source || !amount) return;

        addIncome({
            source,
            amount: parseFloat(amount),
            date: new Date().toLocaleDateString(),
        });

        setSource("");
        setAmount("");
    };

    return (
        <form onSubmit={handleSubmit} className="income-form">
            <h2>Add Income</h2>
            <input 
                type="text" 
                placeholder="Income Source (e.g., Salary, Freelance)" 
                value={source} 
                onChange={(e) => setSource(e.target.value)} 
                required 
            />
            <input 
                type="number" 
                placeholder="Amount (₹)" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                required 
            />
            <button type="submit" className="action-btn">Add Income</button>

        </form>
    );
};

export default IncomeForm;
