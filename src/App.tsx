import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Login } from "./pages/Login/Login";
import type { AppPage } from "./types/app";`nimport { Dashboard } from "./pages/Dashboard/Dashboard";
import "./styles.css";

type LoginUser = {
  id: number;
  name: string;
  username: string;
  theme: "tommy" | "ashley";
  hasAmazonFlex: boolean;
};

const navItems: { id: AppPage; label: string; tommyOnly?: boolean }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "budget", label: "Budget" },
  { id: "bills", label: "Bills" },
  { id: "card", label: "Spending Card" },
  { id: "transactions", label: "Transactions" },
  { id: "flex", label: "Amazon Flex", tommyOnly: true },
  { id: "settings", label: "Settings" }
];

function App() {
  const [user, setUser] = useState<LoginUser | null>(null);
  const [page, setPage] = useState<AppPage>("dashboard");

  useEffect(() => {
    const saved = localStorage.getItem("casellaIQUser");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  function handleLogin(nextUser: LoginUser, remember: boolean) {
    setUser(nextUser);
    if (remember) localStorage.setItem("casellaIQUser", JSON.stringify(nextUser));
  }

  function logout() {
    localStorage.removeItem("casellaIQUser");
    setUser(null);
    setPage("dashboard");
  }

  if (!user) return <Login onLogin={handleLogin} />;

  const isAshley = user.theme === "ashley";
  const cardLabel = isAshley ? "Spennnin Money" : "Spending Card";
  const visibleNav = navItems.filter(item => !item.tommyOnly || user.hasAmazonFlex);

  return (
    <div className={`app ${user.theme}`}>
      <aside className="sidebar">
        <div className="brand">Casella<span>IQ</span></div>

        <div className="profile-pill">
          <strong>{user.name}</strong>
          <span>{isAshley ? "Pink Unicorn Theme" : "Blue Tech Theme"}</span>
        </div>

        <nav>
          {visibleNav.map(item => (
            <button
              key={item.id}
              className={page === item.id ? "nav-active" : ""}
              onClick={() => setPage(item.id)}
            >
              {item.id === "card" ? cardLabel : item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main>
        <header className="topbar">
          <div>
            <h1>{page === "card" ? cardLabel : page[0].toUpperCase() + page.slice(1)}</h1>
            <p>Welcome back, {user.name} {isAshley ? "✨🦄" : "👋"} · v0.2.3 Alpha</p>
          </div>
          <button className="switch-btn" onClick={logout}>Logout</button>
        </header>

        <section className="content">
          {page === "dashboard" && <Dashboard userName={user.name} hasAmazonFlex={user.hasAmazonFlex} cardLabel={cardLabel} />}
          {page !== "dashboard" && <PageView page={page} user={user} cardLabel={cardLabel} />}
        </section>
      </main>
    </div>
  );
}

function Dashboard({ user, cardLabel }: { user: LoginUser; cardLabel: string }) {
  const data = user.theme === "tommy"
    ? { bills: "$415.00", spending: "$704.36", save: "$400.00", cash: "$795.24" }
    : { bills: "$350.00", spending: "$980.00", save: "$420.00", cash: "$1,250.00" };

  return (
    <>
      <section className="stats-grid">
        <Metric title="Bills Remaining" value={data.bills} sub="Unpaid bills only" />
        <Metric title="Spending Budget" value={data.spending} sub={`Groceries + misc + ${cardLabel}`} />
        <Metric title="Available to Save" value={data.save} sub="After bills, spending, cushion" />
        <Metric title="Cash Left" value={data.cash} sub="Live checking estimate" />
      </section>

      <section className="two-col">
        <div className="panel">
          <h2>Upcoming Paycheck</h2>
          <div className="countdown">
            <div><strong>12</strong><span>Days</span></div>
            <div><strong>14</strong><span>Hours</span></div>
            <div><strong>32</strong><span>Minutes</span></div>
          </div>
          <p>Paycheck #2 · Jun 26 · $2,164.60</p>
        </div>

        {user.hasAmazonFlex && (
          <div className="panel">
            <h2>Amazon Flex</h2>
            <div className="big-money">$0.00</div>
            <p>Tommy only income tracker</p>
          </div>
        )}
      </section>
    </>
  );
}

function Metric({ title, value, sub }: { title: string; value: string; sub: string }) {
  return <div className="metric"><p>{title}</p><h2>{value}</h2><span>{sub}</span></div>;
}

function PageView({ page, user, cardLabel }: { page: AppPage; user: LoginUser; cardLabel: string }) {
  const title = page === "card" ? cardLabel : page[0].toUpperCase() + page.slice(1);
  return <div className="panel full"><h2>{title}</h2><p>This section is ready for {user.name}'s database data.</p></div>;
}

createRoot(document.getElementById("root")!).render(<App />);

