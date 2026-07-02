import { useEffect, useState } from "react";
import "./Dashboard.css";

type DashboardProps = {
  userId: number;
  userName: string;
  hasAmazonFlex: boolean;
  cardLabel: string;
};

type Transaction = {
  id: number;
  transactionDate: string;
  merchant: string | null;
  description: string;
  amount: number;
  category: string;
  accountName: string | null;
};

type Bill = {
  name: string;
  amount: number;
  split: boolean;
};

type DashboardData = {
  payPeriod: {
    lastPayday: string;
    nextPayday: string;
    paycheckAmount: number;
    daysUntilPayday: number;
  };
  accounts: {
    checkingBalance: number;
    spendingCardBalance: number;
    count: number;
  };
  bills: {
    remaining: number;
    count: number;
    items?: Bill[];
  };
  spending: {
    currentPeriod: number;
  };
  recommendations: {
    suggestedCushion: number;
    safeToSave: number;
    safeToSpend: number;
  };
};

type TileKey = "checking" | "groceries" | "bills" | "spendingCard" | "misc" | "monthly";

export function Dashboard({ userId, userName, hasAmazonFlex, cardLabel }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTile, setActiveTile] = useState<TileKey>("checking");

  const groceriesBudget = 350;

  useEffect(() => {
    async function load() {
      const dashboardRes = await fetch("/api/dashboard/" + userId);
      const dashboardJson = await dashboardRes.json();

      if (dashboardJson.ok) {
        setData(dashboardJson);
      }

      const txRes = await fetch("/api/transactions/" + userId + "?limit=500");
      const txJson = await txRes.json();

      if (txJson.ok) {
        setTransactions(txJson.transactions);
      }
    }

    load();
  }, [userId]);

  if (!data) {
    return <div className="panel">Loading dashboard...</div>;
  }

  function money(value: number) {
    return Number(value || 0).toLocaleString("en-US", {
      style: "currency",
      currency: "USD"
    });
  }

  function txText(tx: Transaction) {
    return String((tx.merchant || "") + " " + (tx.description || "")).toLowerCase();
  }

  const periodTransactions = transactions.filter(tx => tx.transactionDate >= data.payPeriod.lastPayday && tx.transactionDate < data.payPeriod.nextPayday);`n`n  const groceryTransactions = periodTransactions.filter(tx => {
    const text = txText(tx);
    return tx.amount < 0 && (
      text.includes("bakers") ||
      text.includes("walmart") ||
      text.includes("hy-vee") ||
      text.includes("grocery") ||
      text.includes("supermerc")
    );
  });

  const miscTransactions = periodTransactions.filter(tx => {
    return tx.amount < 0 && tx.category === "Uncategorized";
  });

  const spendingCardTransactions = periodTransactions.filter(tx => {
    const account = String(tx.accountName || "").toLowerCase();
    return account.includes("spending") || account.includes("card");
  });

  const grocerySpent = Math.abs(groceryTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0));
  const groceryLeft = Math.max(0, groceriesBudget - grocerySpent);

  const monthlySpent = Math.abs(transactions
    .filter(tx => tx.amount < 0)
    .reduce((sum, tx) => sum + Number(tx.amount), 0));

  const selectedTransactions =
    activeTile === "checking" ? periodTransactions :
    activeTile === "groceries" ? groceryTransactions :
    activeTile === "spendingCard" ? spendingCardTransactions :
    activeTile === "misc" ? miscTransactions :
    periodTransactions;

  return (
    <div className="dashboard-page">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">CasellaIQ Command Center</p>
          <h2>Welcome back, {userName}</h2>
          <p>{data.payPeriod.lastPayday} to {data.payPeriod.nextPayday}</p>
        </div>

        <div className="iq-score">
          <span>Payday</span>
          <strong>{data.payPeriod.daysUntilPayday}</strong>
          <small>Days left</small>
        </div>
      </section>

      <section className="tile-grid">
        <button className={activeTile === "checking" ? "dash-tile active" : "dash-tile"} onClick={() => setActiveTile("checking")}>
          <span>Checking</span>
          <strong>{money(data.accounts.checkingBalance)}</strong>
          <small>Click to view transactions</small>
        </button>

        <button className={activeTile === "groceries" ? "dash-tile active" : "dash-tile"} onClick={() => setActiveTile("groceries")}>
          <span>Groceries</span>
          <strong>{money(groceryLeft)}</strong>
          <small>{money(grocerySpent)} spent of {money(groceriesBudget)}</small>
        </button>

        <button className={activeTile === "bills" ? "dash-tile active" : "dash-tile"} onClick={() => setActiveTile("bills")}>
          <span>Bills</span>
          <strong>{money(data.bills.remaining)}</strong>
          <small>{data.bills.count} due this pay period</small>
        </button>

        <button className={activeTile === "spendingCard" ? "dash-tile active" : "dash-tile"} onClick={() => setActiveTile("spendingCard")}>
          <span>{cardLabel}</span>
          <strong>{money(data.accounts.spendingCardBalance)}</strong>
          <small>Connected card/account later</small>
        </button>

        <button className={activeTile === "misc" ? "dash-tile active" : "dash-tile"} onClick={() => setActiveTile("misc")}>
          <span>Misc</span>
          <strong>{money(Math.abs(miscTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0)))}</strong>
          <small>Uncategorized spending</small>
        </button>

        <button className={activeTile === "monthly" ? "dash-tile active" : "dash-tile"} onClick={() => setActiveTile("monthly")}>
          <span>This Pay Period Spent</span>
          <strong>{money(data.spending.currentPeriod)}</strong>
          <small>Imported bank transactions</small>
        </button>
      </section>

      <section className="two-col">
        <div className="panel">
          <h2>Quick Decision</h2>
          <div className="decision-row">
            <span>Safe To Spend</span>
            <strong>{money(data.recommendations.safeToSpend)}</strong>
          </div>
          <div className="decision-row">
            <span>Safe To Save</span>
            <strong>{money(data.recommendations.safeToSave)}</strong>
          </div>
          <div className="decision-row">
            <span>Suggested Cushion</span>
            <strong>{money(data.recommendations.suggestedCushion)}</strong>
          </div>
        </div>

        <div className="panel">
          <h2>Next Paycheck</h2>
          <div className="big-money">{money(data.payPeriod.paycheckAmount)}</div>
          <p>{data.payPeriod.daysUntilPayday} days until payday.</p>
          <p>If you can wait, the system knows more money is coming on {data.payPeriod.nextPayday}.</p>
        </div>
      </section>

      <section className="panel">
        <h2>
          {activeTile === "checking" && "Checking Transactions"}
          {activeTile === "groceries" && "Grocery Spending"}
          {activeTile === "bills" && "Bills This Pay Period"}
          {activeTile === "spendingCard" && cardLabel + " Activity"}
          {activeTile === "misc" && "Misc / Uncategorized Spending"}
          {activeTile === "monthly" && "Pay Period Spending"}
        </h2>

        {activeTile === "bills" ? (
          <div className="detail-list">
            {(data.bills.items || []).map((bill, index) => (
              <div className="detail-row" key={index}>
                <div>
                  <strong>{bill.name}</strong>
                  <p>{bill.split ? "Split each payday" : "Due this pay period"}</p>
                </div>
                <strong>{money(bill.amount)}</strong>
              </div>
            ))}
          </div>
        ) : (
          <div className="detail-list">
            {selectedTransactions.slice(0, 40).map(tx => (
              <div className="detail-row" key={tx.id}>
                <div>
                  <strong>{tx.merchant || tx.description}</strong>
                  <p>{tx.transactionDate} · {tx.accountName || "Account"} · {tx.category}</p>
                </div>
                <strong>{money(tx.amount)}</strong>
              </div>
            ))}
          </div>
        )}
      </section>

      {hasAmazonFlex && (
        <section className="panel">
          <h2>Amazon Flex</h2>
          <p>Later this will show how many Flex blocks would cover bills or increase safe-to-spend.</p>
        </section>
      )}
    </div>
  );
}

