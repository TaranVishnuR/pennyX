import { useState } from "react";

const ExpenseList = ({ expenses, deleteExpense, clearAllExpenses }) => {
    // State for category filter
    const [filter, setFilter] = useState("All");

    // Calculate total expenses
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Filter expenses based on category
    const filteredExpenses = filter === "All" ? expenses : expenses.filter(expense => expense.category === filter);

    // Function to group expenses by month
    const groupByMonth = () => {
        const months = {};
        expenses.forEach(expense => {
            const month = new Date(expense.date).toLocaleString('default', { month: 'long', year: 'numeric' });
            if (!months[month]) {
                months[month] = [];
            }
            months[month].push(expense);
        });
        return months;
    };

    const monthlyExpenses = groupByMonth();

    return (
        <div className="expense-list">
            <h2>Expense History</h2>

            {/* Filter Dropdown */}
            <select className="filter-dropdown" value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="All">All Categories</option>
                <option value="Groceries">Groceries</option>
                <option value="Rent">Rent</option>
                <option value="Utilities">Utilities</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Investments">Investments</option>
            </select>

            <ul>
                {filteredExpenses.length === 0 ? (
                    <p>No expenses in this category.</p>
                ) : (
                    filteredExpenses.map((expense, index) => (
                        <li key={index}>
                            <span>{expense.title} - ₹{expense.amount}</span>
                            <small>({expense.category} - {expense.date})</small>
                            <button className="delete-btn" onClick={() => deleteExpense(index)}>❌</button>
                        </li>
                    ))
                )}
            </ul>

            {/* Show total expenses */}
            <h3 className="total-expenses">Total Spent: ₹{totalAmount}</h3>

            {/* Monthly Report Section */}
            <div className="monthly-report">
                <h2>Monthly Expenses</h2>
                {Object.keys(monthlyExpenses).length === 0 ? (
                    <p>No monthly data available.</p>
                ) : (
                    Object.keys(monthlyExpenses).map((month, index) => (
                        <div key={index} className="month-section">
                            <h3>{month}</h3>
                            <ul>
                                {monthlyExpenses[month].map((expense, idx) => (
                                    <li key={idx}>
                                        <span>{expense.title} - ₹{expense.amount}</span>
                                        <small>({expense.category})</small>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))
                )}
            </div>

            {/* Clear All & Export Buttons */}
            {expenses.length > 0 && (
                <>
                    <button className="clear-btn" onClick={clearAllExpenses}>Clear All Expenses</button>
                    <button className="export-btn" onClick={() => alert("Exporting not yet implemented!")}>Export to CSV</button>
                </>
            )}
        </div>
    );
};

export default ExpenseList;
