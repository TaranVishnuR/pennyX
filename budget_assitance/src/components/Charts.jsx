import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const Charts = ({ expenses }) => {
    if (!expenses || expenses.length === 0) {
        return <p className="chart-message">No expense data available for charts.</p>;
    }

    // Group Expenses by Category for Pie Chart
    const categoryTotals = expenses.reduce((acc, expense) => {
        if (!expense.category) return acc;
        acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount);
        return acc;
    }, {});

    const categoryData = Object.keys(categoryTotals).map(category => ({
        name: category,
        value: categoryTotals[category],
    }));

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28EF0", "#E84C3D"];

    return (
        <div className="chart-container">
            <h2>Expense Analysis</h2>
            <div className="chart-box">
                <h3>Expenses by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={categoryData} cx="50%" cy="50%" outerRadius={100} label>
                            {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Charts;
