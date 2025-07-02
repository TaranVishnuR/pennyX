const RecurringList = ({ recurringExpenses, deleteRecurring }) => {
    return (
        <div className="recurring-list">
            <h2>Recurring Payments</h2>
            <ul>
                {recurringExpenses.length === 0 ? (
                    <p>No recurring expenses added.</p>
                ) : (
                    recurringExpenses.map((expense, index) => (
                        <li key={index}>
                            <span>{expense.title} - ₹{expense.amount}</span>
                            <small>({expense.category} - Due: {expense.date})</small>
                            <button className="delete-btn" onClick={() => deleteRecurring(index)}>❌</button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default RecurringList;
