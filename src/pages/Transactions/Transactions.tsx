import { useEffect, useState } from "react";

type Transaction = {
  id: number;
  transactionDate: string;
  merchant: string | null;
  description: string;
  amount: number;
  category: string;
  pending: number;
  reviewed: number;
  accountName: string | null;
};

export function Transactions({ userId }: { userId: number }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/transactions/${userId}?limit=200`);
      const data = await res.json();
      if (data.ok) setTransactions(data.transactions);
      setLoading(false);
    }

    load();
  }, [userId]);

  return (
    <div className="panel full">
      <h2>Transactions</h2>
      <p>{loading ? "Loading..." : `${transactions.length} latest transactions`}</p>

      <div style={{ display: "grid", gap: 10 }}>
        {transactions.map(tx => (
          <div key={tx.id} style={{
            display: "grid",
            gridTemplateColumns: "120px 1fr 120px",
            gap: 12,
            padding: "12px 0",
            borderBottom: "1px solid rgba(255,255,255,.08)"
          }}>
            <span>{tx.transactionDate}</span>
            <div>
              <strong>{tx.merchant || tx.description}</strong>
              <div style={{ opacity: .65, fontSize: 13 }}>
                {tx.accountName || "Account"} · {tx.category}
              </div>
            </div>
            <strong style={{ textAlign: "right" }}>
              {Number(tx.amount).toLocaleString(undefined, { style: "currency", currency: "USD" })}
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
}