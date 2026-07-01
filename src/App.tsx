import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type User = "tommy" | "ashley";
type Page = "dashboard" | "budget" | "bills" | "card" | "transactions" | "flex" | "settings";

const navItems: { id: Page; label: string; tommyOnly?: boolean }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "budget", label: "Budget" },
  { id: "bills", label: "Bills" },
  { id: "card", label: "Spending Card" },
  { id: "transactions", label: "Transactions" },
  { id: "flex", label: "Amazon Flex", tommyOnly: true },
  { id: "settings", label: "Settings" }
];

function App() {
  const [user, setUser] = useState<User>("tommy");
  const [page, setPage] = useState<Page>("dashboard");

  const isAshley = user === "ashley";
  const cardLabel = isAshley ? "Spennnin Money" : "Spending Card";

  function switchUser(next: User) {
    setUser(next);
    setPage("dashboard");
  }

  const visibleNav = navItems.filter(item => !item.tommyOnly || user === "tommy");

  return (
    <div className={`app ${isAshley ? "ashley" : "tommy"}`}>
      <aside className="sidebar">
        <div className="brand">Budget<span>IQ</span></div>

        <div className="user-switch">
          <button className={user === "tommy" ? "active" : ""} onClick={() => switchUser("tommy")}>Tommy</button>
          <button className={user === "ashley" ? "active" : ""} onClick={() => switchUser("ashley")}>Ashley</button>
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
            <p>{isAshley ? "Welcome back, Ashley ???" : "Welcome back, Tommy ??"} · v0.2.0 Alpha</p>
          </div>
          <button className="switch-btn" onClick={() => switchUser(isAshley ? "tommy" : "ashley")}>Switch User</button>
        </header>

        <section className="content">
          {page === "dashboard" && <Dashboard user={user} cardLabel={cardLabel} />}
          {page !== "dashboard" && <PageView page={page} user={user} cardLabel={cardLabel} />}
        </section>
      </main>
    </div>
  );
}

function Dashboard({ user, cardLabel }: { user: User; cardLabel: string }) {
  const data = user === "tommy"
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

        {user === "tommy" && (
          <div className="panel">
            <h2>Amazon Flex</h2>
            <div className="big-money">$0.00</div>
            <p>Tommy only income tracker</p>
          </div>
        )}
      </section>

      <section className="two-col">
        <ListPanel title="Bills" items={["State Farm — $16.00", "YouTube Premium — $17.00", "Cricket Wireless — $98.00", "MUD Half Payment — $84.00"]} />
        <ListPanel title="Recent Transactions" items={["Bakers ? Groceries", "Amazon ? Misc", `Card Transfer ? ${cardLabel}`]} />
      </section>
    </>
  );
}

function Metric({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <div className="metric">
      <p>{title}</p>
      <h2>{value}</h2>
      <span>{sub}</span>
    </div>
  );
}

function ListPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="panel">
      <h2>{title}</h2>
      <ul>
        {items.map(item => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}

function PageView({ page, user, cardLabel }: { page: Page; user: User; cardLabel: string }) {
  const title = page === "card" ? cardLabel : page[0].toUpperCase() + page.slice(1);

  return (
    <div className="panel full">
      <h2>{title}</h2>
      <p>This section is ready to connect to the database next.</p>
      {page === "flex" && user === "tommy" && <p>Amazon Flex is only enabled for Tommy.</p>}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);

