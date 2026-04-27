import { useState, useEffect } from "react";
import "./App.css";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const EXPENSE_CATEGORIES = [
  "Food", "Travel", "Shopping", "Entertainment", "Bills", "Other",
];

const INCOME_SOURCES = [
  "Salary", "Freelance", "Business", "Investment", "Other",
];

function App() {
  // AUTH
  const [currentUser, setCurrentUser] = useState(
    localStorage.getItem("currentUser")
  );
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // DATA
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (currentUser) {
      const data = localStorage.getItem(`transactions_${currentUser}`);
      setTransactions(data ? JSON.parse(data) : []);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(
        `transactions_${currentUser}`,
        JSON.stringify(transactions)
      );
    }
  }, [transactions]);

  // AUTH FUNCTIONS
  const handleSignup = () => {
    const users = JSON.parse(localStorage.getItem("users")) || {};
    if (!username || !password) return alert("Enter details");
    if (users[username]) return alert("User already exists");

    users[username] = password;
    localStorage.setItem("users", JSON.stringify(users));

    alert("Signup successful!");
    setIsSignup(false);
    setUsername("");
    setPassword("");
  };

  const handleLogin = () => {
    const users = JSON.parse(localStorage.getItem("users")) || {};
    if (users[username] === password) {
      localStorage.setItem("currentUser", username);
      setCurrentUser(username);
      setUsername("");
      setPassword("");
    } else alert("Invalid credentials");
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setTransactions([]);
  };

  // FORM
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");

  // FILTERS
  const [month, setMonth] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  // ADD
  const addTransaction = () => {
    if (!category || !amount) return alert("Enter data");

    const newT = {
      id: Date.now(),
      type,
      category,
      amount: Number(amount),
      date: new Date().toISOString(),
    };

    setTransactions([...transactions, newT]);
    setCategory("");
    setAmount("");
  };

  // FILTER LOGIC
  const filtered = transactions.filter((t) => {
    const matchMonth = month ? t.date.slice(0, 7) === month : true;
    const matchCategory =
      filterCategory === "All" || t.category === filterCategory;
    return matchMonth && matchCategory;
  });

  const incomes = filtered.filter((t) => t.type === "income");
  const expenses = filtered.filter((t) => t.type === "expense");

  const income = incomes.reduce((s, t) => s + t.amount, 0);
  const expense = expenses.reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  // CHART
  const expenseMap = {};
  expenses.forEach((t) => {
    expenseMap[t.category] =
      (expenseMap[t.category] || 0) + t.amount;
  });

  const chartData = {
    labels: Object.keys(expenseMap),
    datasets: [
      {
        data: Object.values(expenseMap),
        backgroundColor: [
          "#6366f1",
          "#10b981",
          "#f59e0b",
          "#ef4444",
          "#3b82f6",
          "#ec4899",
        ],
      },
    ],
  };

  // LOGIN PAGE
  if (!currentUser) {
    return (
      <div className="login">
        <div className="login-card">
          <h2>{isSignup ? "📝 Sign Up" : "🔐 Login"}</h2>

          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {isSignup ? (
            <>
              <button onClick={handleSignup}>Sign Up</button>
              <p onClick={() => setIsSignup(false)}>
                Already have account? Login
              </p>
            </>
          ) : (
            <>
              <button onClick={handleLogin}>Login</button>
              <p onClick={() => setIsSignup(true)}>
                New user? Sign Up
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  // DASHBOARD
  return (
    <div className="app">
      <div className="header">
        <h1>💰  EXPENSE DESHBOARD </h1>
        <button onClick={handleLogout}>
          Logout ({currentUser})
        </button>
      </div>

      {/* SUMMARY */}
      <div className="summary">
        <div className="card income">
          <h3>Total Income</h3>
          <h2>₹{income}</h2>
        </div>

        <div className="card expense">
          <h3>Total Expense</h3>
          <h2>₹{expense}</h2>
        </div>

        <div className="card balance">
          <h3>Balance</h3>
          <h2>₹{balance}</h2>
        </div>
      </div>

      {/* FILTERS */}
      <div className="card filters">
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          {[...EXPENSE_CATEGORIES, ...INCOME_SOURCES].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* FORM */}
      <div className="card form">
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Select Category</option>
          {(type === "income" ? INCOME_SOURCES : EXPENSE_CATEGORIES).map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <button onClick={addTransaction}>Add</button>
      </div>

      {/* TABLES */}
      <div className="grid">
        <div className="card">
          <h3>Income Table</h3>
          {incomes.length === 0 ? <p>No income</p> :
            incomes.map((t, i) => (
              <p key={t.id}>{i + 1}. {t.category} - ₹{t.amount}</p>
            ))}
        </div>

        <div className="card">
          <h3>Expense Table</h3>
          {expenses.length === 0 ? <p>No expense</p> :
            expenses.map((t, i) => (
              <p key={t.id}>{i + 1}. {t.category} - ₹{t.amount}</p>
            ))}
        </div>
      </div>

      {/* CHART */}
      <div className="card chart">
        <h3>Expense Chart</h3>
        {Object.keys(expenseMap).length > 0 ? (
          <Pie data={chartData} />
        ) : (
          <p>No data</p>
        )}
      </div>
    </div>
  );
}

export default App;