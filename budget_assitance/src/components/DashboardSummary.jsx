const DashboardSummary = ({ totalIncome, totalExpenses, netBalance }) => {
    return (
        <div className="dashboard-summary">
            <div className="summary-card income-card">
                <h3>Total Income</h3>
                <p>₹{totalIncome}</p>
            </div>
            <div className="summary-card expense-card">
                <h3>Total Expenses</h3>
                <p>₹{totalExpenses}</p>
            </div>
            <div className="summary-card balance-card">
                <h3>Net Balance</h3>
                <p>₹{netBalance}</p>
            </div>
        </div>
    );
};

export default DashboardSummary;
