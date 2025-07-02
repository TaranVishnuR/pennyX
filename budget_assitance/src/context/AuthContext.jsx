import { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, getAuth, signOut } from "firebase/auth";
import { db } from "../firebaseConfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";

// 🔹 Create Authentication Context
const AuthContext = createContext(null);

// 🔹 AuthProvider Component
const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [savings, setSavings] = useState([]);

    const auth = getAuth();

    useEffect(() => {
        let unsubscribeTransactions = () => {};
        let unsubscribeSavings = () => {};

        // 🔹 Subscribe to Auth Changes
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user);

                // ✅ Fetch Transactions in Real-Time
                const transactionsQuery = query(collection(db, "transactions"), where("userId", "==", user.uid));
                unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
                    setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                }, (error) => {
                    console.error("❌ Firestore Transaction Error:", error);
                    if (error.code === "permission-denied") setTransactions([]);
                });

                // ✅ Fetch Savings in Real-Time
                const savingsQuery = query(collection(db, "savings"), where("userId", "==", user.uid));
                unsubscribeSavings = onSnapshot(savingsQuery, (snapshot) => {
                    setSavings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                }, (error) => {
                    console.error("❌ Firestore Savings Error:", error);
                    if (error.code === "permission-denied") setSavings([]);
                });

            } else {
                setCurrentUser(null);
                setTransactions([]); 
                setSavings([]);
            }
            setLoading(false);
        });

        return () => {
            unsubscribeAuth();
            unsubscribeTransactions();
            unsubscribeSavings();
        };
    }, []);

    // ✅ Logout Function
    const logout = async () => {
        try {
            await signOut(auth);
            setCurrentUser(null);
            setTransactions([]);
            setSavings([]);
        } catch (error) {
            console.error("❌ Error logging out:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ currentUser, transactions, setTransactions, savings, setSavings, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// ✅ Custom Hook to Use AuthContext
const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

// ✅ Corrected Export (Fixes Vite Fast Refresh Error)
export { AuthProvider, useAuth };
