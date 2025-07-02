import { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

const ExpenseForm = () => {
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("Groceries");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, "transactions"), {
                title,
                amount: parseFloat(amount),
                category,
                date: new Date().toISOString()
            });
            setTitle("");
            setAmount("");
            alert("Expense Added to Firestore!");
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Expense Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <input type="number" placeholder="Amount (₹)" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Groceries">Groceries</option>
                <option value="Rent">Rent</option>
                <option value="Utilities">Utilities</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Others">Others</option>
            </select>
            <button type="submit">Add Expense</button>
        </form>
    );
};

export default ExpenseForm;
