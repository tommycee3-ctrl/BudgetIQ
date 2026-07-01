import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Login } from "./pages/Login/Login";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import { BankConnections } from "./pages/BankConnections/BankConnections";
import type { AppPage } from "./types/app";
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
  { id: "bank", label: "Bank Connections" },
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
            <p>Welcome back, {user.name} {isAshley ? "✨🦄" : "👋"} · v0.6.4 Alpha</p>
          </div>
          <button className="switch-btn" onClick={logout}>Logout</button>
        </header>

        <section className="content">
          {page === "dashboard" && (
            <Dashboard
              userName={user.name}
              hasAmazonFlex={user.hasAmazonFlex}
              cardLabel={cardLabel}
            />
          )}

          {page === "bank" && <BankConnections userId={user.id} />}

          {page !== "dashboard" && page !== "bank" && (
            <PageView page={page} user={user} cardLabel={cardLabel} />
          )}
        </section>
      </main>
    </div>
  );
}

function PageView({ page, user, cardLabel }: { page: AppPage; user: LoginUser; cardLabel: string }) {
  const title = page === "card" ? cardLabel : page[0].toUpperCase() + page.slice(1);
  return <div className="panel full"><h2>{title}</h2><p>This section is ready for {user.name}'s database data.</p></div>;
}

createRoot(document.getElementById("root")!).render(<App />);