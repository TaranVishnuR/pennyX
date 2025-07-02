const IncomeList = ({ incomes, deleteIncome }) => {
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

    return (
        <div className="income-list">
            <h2>Income History</h2>
            <ul>
                {incomes.length === 0 ? (
                    <p>No income added yet.</p>
                ) : (
                    incomes.map((income, index) => (
                        <li key={index}>
                            <span>{income.source} - ₹{income.amount}</span>
                            <small>({income.date})</small>
                            <button className="delete-btn" onClick={() => deleteIncome(index)}>❌</button>
                        </li>
                    ))
                )}
            </ul>
            <h3 className="total-income">Total Income: ₹{totalIncome}</h3>
        </div>
    );
};

export default IncomeList;
