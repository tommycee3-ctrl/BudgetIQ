import { useEffect, useState } from "react";
import "./BankConnections.css";

type BankConnection = {
  id: number;
  provider: string;
  displayName?: string;
  friendlyName?: string;
  lastSync: string | null;
  enabled: number;
};

type UserAccount = {
  id: number;
  accountName: string;
  currentBalance: number;
  availableBalance: number;
  enabled: boolean;
  bankName: string;
};

export function BankConnections({ userId }: { userId: number }) {
  const [connections, setConnections] = useState<BankConnection[]>([]);
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [friendlyName, setFriendlyName] = useState("First Interstate Bank");
  const [setupToken, setSetupToken] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function money(value: number) {
    return Number(value || 0).toLocaleString("en-US", {
      style: "currency",
      currency: "USD"
    });
  }

  async function loadAll() {
    const statusRes = await fetch("/api/bank/status/" + userId);
    const statusData = await statusRes.json();
    if (statusData.ok) setConnections(statusData.connections || []);

    const accountRes = await fetch("/api/bank/user-accounts/" + userId);
    const accountData = await accountRes.json();
    if (accountData.ok) setAccounts(accountData.accounts || []);
  }

  async function connectBank() {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/bank/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, setupToken, friendlyName })
      });

      const data = await res.json();

      if (!data.ok) {
        setMessage(data.message || "Connection failed.");
        return;
      }

      setSetupToken("");
      setMessage("Bank connected. Choose which accounts to use below.");
      await loadAll();
    } catch {
      setMessage("Could not connect to CasellaIQ server.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleAccount(account: UserAccount) {
    await fetch("/api/bank/accounts/" + account.id + "/enabled", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !account.enabled })
    });

    await loadAll();
  }

  useEffect(() => {
    loadAll();
  }, [userId]);

  return (
    <div className="bank-page">
      <div className="page-header">
        <div>
          <h2>🏦 Bank Connections</h2>
          <p>Connect banks and choose which accounts this user can use.</p>
        </div>
      </div>

      <div className="bank-card">
        <h3>Connect Bank</h3>

        <label>Bank Name</label>
        <input value={friendlyName} onChange={e => setFriendlyName(e.target.value)} />

        <label>Secure Connection Code</label>
        <textarea
          value={setupToken}
          onChange={e => setSetupToken(e.target.value)}
          placeholder="Paste the secure connection code here"
        />

        <button className="primary-btn" onClick={connectBank} disabled={loading || !setupToken}>
          {loading ? "Connecting..." : "Connect Bank"}
        </button>

        {message && <p className="bank-message">{message}</p>}
      </div>

      <div className="bank-card">
        <h3>Connected Banks</h3>

        {connections.length === 0 && <p>No banks connected yet.</p>}

        {connections.map(connection => (
          <div className="connection-row" key={connection.id}>
            <div>
              <strong>{connection.displayName || connection.friendlyName || "Connected Bank"}</strong>
              <p>{connection.provider} · {connection.lastSync || "Never synced"}</p>
            </div>
            <span className="connected">● Connected</span>
          </div>
        ))}
      </div>

      <div className="bank-card">
        <h3>Account Selection</h3>
        <p>Only enabled accounts are used for this user's dashboard, transactions, and budgets.</p>

        {accounts.map(account => (
          <div className="account-row" key={account.id}>
            <input
              type="checkbox"
              checked={account.enabled}
              onChange={() => toggleAccount(account)}
            />

            <div>
              <strong>{account.accountName}</strong>
              <p>{account.bankName} · {money(account.currentBalance)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
