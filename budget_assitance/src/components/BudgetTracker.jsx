import { useState, useEffect } from "react";

const BudgetTracker = ({ totalExpenses }) => {
    const [budget, setBudget] = useState(() => {
        const savedBudget = localStorage.getItem("budget");
        return savedBudget ? JSON.parse(savedBudget) : 5000; // Default budget ₹5000
    });

    useEffect(() => {
        localStorage.setItem("budget", JSON.stringify(budget));
    }, [budget]);

    const handleBudgetChange = (e) => {
        setBudget(parseFloat(e.target.value));
    };

    const isOverBudget = totalExpenses > budget;
    const progress = Math.min((totalExpenses / budget) * 100, 100);

    return (
        <div className="budget-tracker">
            <h2>Budget Goal</h2>
            <input 
                type="number" 
                value={budget} 
                onChange={handleBudgetChange} 
                placeholder="Set Monthly Budget (₹)" 
            />
            <div className="progress-bar">
                <div className="progress" style={{ width: `${progress}%`, background: isOverBudget ? "red" : "#3498db" }}>
                    {progress.toFixed(1)}%
                </div>
            </div>
            {isOverBudget && <p className="alert">⚠️ You have exceeded your budget!</p>}
        </div>
    );
};

export default BudgetTracker;
