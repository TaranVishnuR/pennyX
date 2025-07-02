import "regenerator-runtime/runtime"; // ✅ Required for async/await support
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore,
  setDoc,
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  Timestamp
} from "firebase/firestore";

// ✅ Firebase Configuration (Environment-based)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// ✅ Save User to Firestore
const saveUserToFirestore = async (user) => {
  if (!user) return;

  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName || "Unknown User",
        email: user.email || "",
        profilePic: user.photoURL || "",
        provider: user.providerData[0]?.providerId || "unknown",
        createdAt: Timestamp.now()
      });
      console.log("✅ User saved to Firestore:", user.displayName);
    }
  } catch (error) {
    console.error("❌ Error saving user to Firestore:", error);
  }
};

// ✅ Google Sign-In
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await saveUserToFirestore(result.user);
    console.log("✅ Google Login Success:", result.user);
    return result.user;
  } catch (error) {
    console.error("❌ Google Login Error:", error.message);
    throw error;
  }
};

// ✅ Add Transaction
const addTransaction = async (userId, type, category, amount, date) => {
  if (!userId || !amount || amount <= 0) {
    console.error("❌ Error: Invalid data!");
    return;
  }

  try {
    const transactionData = {
      userId,
      type,
      category,
      amount: Number(amount),
      date,
      timestamp: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, "transactions"), transactionData);
    console.log(`✅ Transaction Added [ID: ${docRef.id}]`);
    return docRef.id;
  } catch (error) {
    console.error("❌ Error Adding Transaction:", error);
    throw error;
  }
};

// ✅ Fetch Transactions (Realtime)
const fetchTransactions = (userId, setTransactions) => {
  if (!userId) {
    console.error("⚠️ No user ID found, skipping Firestore fetch.");
    return;
  }

  try {
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );

    return onSnapshot(q, (snapshot) => {
      const transactionsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.seconds
          ? new Date(doc.data().timestamp.seconds * 1000)
          : null
      }));
      setTransactions(transactionsData);
    });
  } catch (error) {
    console.error("❌ Error Fetching Transactions:", error);
  }
};

// ✅ Logout
const logoutUser = async () => {
  try {
    await signOut(auth);
    console.log("✅ User Logged Out Successfully");
  } catch (error) {
    console.error("❌ Logout Error:", error);
  }
};

// ✅ Auth State Listener
const listenToAuthChanges = (setUser) => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("✅ Logged In:", user.email);
      setUser(user);
    } else {
      console.log("❌ Logged Out");
      setUser(null);
    }
  });
};

export {
  auth,
  db,
  signInWithGoogle,
  addTransaction,
  fetchTransactions,
  logoutUser,
  listenToAuthChanges
};
