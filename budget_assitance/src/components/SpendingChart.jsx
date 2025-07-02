import React from "react";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";

const SpendingChart = ({ transactions }) => {
    const categories = ["Groceries", "Rent", "Utilities", "Entertainment", "Shopping"];
    const categorySpending = categories.map(category =>
        transactions.filter(t => t.category === category).reduce((sum, t) => sum + Number(t.amount), 0)
    );

    const data = {
        labels: categories, // We are keeping this for internal calculations
        datasets: [
            {
                label: "Expenses (₹)",
                data: categorySpending,
                backgroundColor: ["#ff6384", "#36a2eb", "#ffcd56", "#4bc0c0", "#9966ff"],
                borderRadius: 5,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                display: false, // 🔥 Hides the X-Axis labels (Groceries, Rent, etc.)
            },
            y: {
                ticks: { color: "#ffffff" },
                grid: { color: "rgba(255,255,255,0.2)" },
            },
        },
        plugins: {
            legend: {
                labels: {
                    color: "#ffffff",
                },
            },
        },
    };

    return (
        <div className="chart-container">
            <Bar data={data} options={options} />
        </div>
    );
};

export default SpendingChart;
