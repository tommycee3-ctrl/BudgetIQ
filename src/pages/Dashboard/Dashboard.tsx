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

type BillOption = {
  id: number;
  name: string;
  amount: number;
  dueDay: number;
  paid: number;
};

type Bill = {
  name: string;
  amount: number;
  split: boolean;
};

type DashboardData = {
  payPeriod: { lastPayday: string; nextPayday: string; paycheckAmount: number; daysUntilPayday: number };
  accounts: { checkingBalance: number; spendingCardBalance: number; count: number };
  bills: { remaining: number; count: number; items?: Bill[] };
  spending: { currentPeriod: number };
  recommendations: { suggestedCushion: number; safeToSave: number; safeToSpend: number };
};

type TileKey = "checking" | "groceries" | "bills" | "spendingCard" | "misc" | "monthly";

const categories = [
  "Uncategorized",
  "Groceries",
  "Food",
  "Entertainment",
  "Bills",
  "Gas",
  "Shopping",
  "Household",
  "Medical",
  "Amazon",
  "Transfer",
  "Income",
  "Misc"
];

const ruleOptions = [
  { value: "none", label: "No Rule" },
  { value: "merchant", label: "Merchant" },
  { value: "amount", label: "Amount" },
  { value: "merchant_amount", label: "Both" }
];

function cleanName(tx: Transaction) {
  const raw = String(tx.description || tx.merchant || "Transaction");
  const lower = raw.toLowerCase();

  if (lower.includes("youtube")) return "YouTube Premium";
  if (lower.includes("bakers")) return "Bakers";
  if (lower.includes("walmart") || lower.includes("wm supercenter")) return "Walmart";
  if (lower.includes("amazon prime")) return "Amazon Prime";
  if (lower.includes("amazon") || lower.includes("amzn")) return "Amazon";
  if (lower.includes("affirm")) return "Affirm";
  if (lower.includes("gm financial")) return "GM Financial";
  if (lower.includes("cricket")) return "Cricket";
  if (lower.includes("oppd")) return "OPPD";
  if (lower.includes("mud")) return "MUD";
  if (lower.includes("dashpass")) return "DashPass";
  if (lower.includes("state farm")) return "State Farm";
  if (lower.includes("google fiber")) return "Google Fiber";
  if (lower.includes("vasa")) return "VASA";
  if (lower.includes("plex")) return "Plex";
  if (lower.includes("crunchyroll")) return "Crunchyroll";
  if (lower.includes("cornhusker")) return "Cornhusker Wash";
  if (lower.includes("mcdonald")) return "McDonald's";
  if (lower.includes("roja")) return "Roja Mexican Grill";
  if (lower.includes("caseys")) return "Casey's";
  if (lower.includes("west lanes")) return "West Lanes Bowling";
  if (tx.merchant && tx.merchant.length > 3) return tx.merchant;

  return raw.replace(/\s+\d{2}\/\d{2}.*/, "").replace(/\bWEB ID:.*/i, "").replace(/\bPPD ID:.*/i, "").trim();
}

export function Dashboard({ userId, userName, hasAmazonFlex, cardLabel }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bills, setBills] = useState<BillOption[]>([]);
  const [activeTile, setActiveTile] = useState<TileKey>("checking");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Record<number, string>>({});
  const [selectedRule, setSelectedRule] = useState<Record<number, string>>({});
  const [selectedBill, setSelectedBill] = useState<Record<number, string>>({});

  const groceriesBudget = 350;

  async function load() {
    const dashboardRes = await fetch("/api/dashboard/" + userId);
    const dashboardJson = await dashboardRes.json();
    if (dashboardJson.ok) setData(dashboardJson);

    const txRes = await fetch("/api/transactions/" + userId + "?limit=500");
    const txJson = await txRes.json();
    if (txJson.ok) setTransactions(txJson.transactions);

    const billsRes = await fetch("/api/bills/" + userId);
    const billsJson = await billsRes.json();
    if (billsJson.ok) setBills(billsJson.bills);
  }

  useEffect(() => {
    load();
  }, [userId]);

  if (!data) return <div className="panel">Loading dashboard...</div>;

  function money(value: number) {
    return Number(value || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });
  }

  async function saveTransaction(tx: Transaction) {
    const category = selectedCategory[tx.id] || tx.category || "Uncategorized";
    const billId = selectedBill[tx.id] || "";
    const matchType = selectedRule[tx.id] || "none";

    await fetch("/api/transactions/" + tx.id + "/categorize", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category,
        billId: billId ? Number(billId) : null,
        applyToMerchant: matchType !== "none",
        matchType
      })
    });

    setExpandedId(null);
    await load();
  }

  const periodTransactions = transactions.filter(
    tx => tx.transactionDate >= data.payPeriod.lastPayday && tx.transactionDate < data.payPeriod.nextPayday
  );

  const groceryTransactions = periodTransactions.filter(tx => tx.amount < 0 && tx.category === "Groceries");
  const miscTransactions = periodTransactions.filter(tx => tx.amount < 0 && tx.category === "Uncategorized");
  const spendingCardTransactions = periodTransactions.filter(tx => {
    const account = String(tx.accountName || "").toLowerCase();
    return account.includes("spending") || account.includes("card");
  });

  const grocerySpent = Math.abs(groceryTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0));
  const groceryLeft = Math.max(0, groceriesBudget - grocerySpent);

  const selectedTransactions =
    activeTile === "checking" ? periodTransactions :
    activeTile === "groceries" ? groceryTransactions :
    activeTile === "spendingCard" ? spendingCardTransactions :
    activeTile === "misc" ? miscTransactions :
    periodTransactions;

  const unpaidBills = bills.filter(b => !b.paid);

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
          <span>Checking</span><strong>{money(data.accounts.checkingBalance)}</strong><small>Current pay period transactions</small>
        </button>

        <button className={activeTile === "groceries" ? "dash-tile active" : "dash-tile"} onClick={() => setActiveTile("groceries")}>
          <span>Groceries</span><strong>{money(groceryLeft)}</strong><small>{money(grocerySpent)} spent of {money(groceriesBudget)}</small>
        </button>

        <button className={activeTile === "bills" ? "dash-tile active" : "dash-tile"} onClick={() => setActiveTile("bills")}>
          <span>Bills</span><strong>{money(data.bills.remaining)}</strong><small>{data.bills.count} due this pay period</small>
        </button>

        <button className={activeTile === "spendingCard" ? "dash-tile active" : "dash-tile"} onClick={() => setActiveTile("spendingCard")}>
          <span>{cardLabel}</span><strong>{money(data.accounts.spendingCardBalance)}</strong><small>Connected card/account later</small>
        </button>

        <button className={activeTile === "misc" ? "dash-tile active" : "dash-tile"} onClick={() => setActiveTile("misc")}>
          <span>Misc</span><strong>{money(Math.abs(miscTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0)))}</strong><small>Uncategorized this pay period</small>
        </button>

        <button className={activeTile === "monthly" ? "dash-tile active" : "dash-tile"} onClick={() => setActiveTile("monthly")}>
          <span>This Pay Period Spent</span><strong>{money(data.spending.currentPeriod)}</strong><small>Imported bank transactions</small>
        </button>
      </section>

      <section className="two-col">
        <div className="panel">
          <h2>Quick Decision</h2>
          <div className="decision-row"><span>Safe To Spend</span><strong>{money(data.recommendations.safeToSpend)}</strong></div>
          <div className="decision-row"><span>Safe To Save</span><strong>{money(data.recommendations.safeToSave)}</strong></div>
          <div className="decision-row"><span>Suggested Cushion</span><strong>{money(data.recommendations.suggestedCushion)}</strong></div>
        </div>

        <div className="panel">
          <h2>Next Paycheck</h2>
          <div className="big-money">{money(data.payPeriod.paycheckAmount)}</div>
          <p>{data.payPeriod.daysUntilPayday} days until payday.</p>
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
                <div><strong>{bill.name}</strong><p>{bill.split ? "Split each payday" : "Due this pay period"}</p></div>
                <strong>{money(bill.amount)}</strong>
              </div>
            ))}
          </div>
        ) : (
          <div className="detail-list">
            {selectedTransactions.slice(0, 60).map(tx => {
              const isOpen = expandedId === tx.id;
              const category = selectedCategory[tx.id] || tx.category || "Uncategorized";

              return (
                <div className={isOpen ? "detail-row transaction-row expanded" : "detail-row transaction-row"} key={tx.id} onClick={() => setExpandedId(isOpen ? null : tx.id)}>
                  <div className="transaction-main">
                    <div className="transaction-summary">
                      <div>
                        <strong>{cleanName(tx)}</strong>
                        <p>{tx.transactionDate} · {tx.accountName || "Account"}</p>
                      </div>
                      <span className={"category-pill " + category.toLowerCase().replaceAll(" ", "-")}>{category}</span>
                    </div>

                    {isOpen && (
                      <div className="expanded-controls" onClick={e => e.stopPropagation()}>
                        <p className="raw-description">{tx.description}</p>

                        <label>Category</label>
                        <select value={category} onChange={e => setSelectedCategory({ ...selectedCategory, [tx.id]: e.target.value })}>
                          {categories.map(item => <option key={item} value={item}>{item}</option>)}
                        </select>

                        <label>Bill</label>
                        <select value={selectedBill[tx.id] || ""} onChange={e => setSelectedBill({ ...selectedBill, [tx.id]: e.target.value })}>
                          <option value="">Not a bill payment</option>
                          {unpaidBills.map(bill => (
                            <option key={bill.id} value={bill.id}>Paid bill: {bill.name} - {money(bill.amount)}</option>
                          ))}
                        </select>

                        <label>Assign Rule</label>
                        <select value={selectedRule[tx.id] || "none"} onChange={e => setSelectedRule({ ...selectedRule, [tx.id]: e.target.value })}>
                          {ruleOptions.map(rule => <option key={rule.value} value={rule.value}>{rule.label}</option>)}
                        </select>

                        <button onClick={() => saveTransaction(tx)}>Save</button>
                      </div>
                    )}
                  </div>

                  <strong>{money(tx.amount)}</strong>
                </div>
              );
            })}
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
