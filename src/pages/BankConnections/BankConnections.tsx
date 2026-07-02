import { useEffect, useState } from "react";
import "./BankConnections.css";

type Account = {
  id: number;
  accountName: string;
  currentBalance: number;
  availableBalance: number;
  enabled: boolean;
};

type ConnectionGroup = {
  id: number;
  bankName: string;
  provider: string;
  lastSync: string | null;
  accounts: Account[];
};

export function BankConnections({ userId }: { userId: number }) {
  const [connections, setConnections] = useState<ConnectionGroup[]>([]);
  const [friendlyName, setFriendlyName] = useState("Chase");
  const [setupToken, setSetupToken] = useState("");
  const [selected, setSelected] = useState<Record<number, number[]>>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function money(value: number) {
    return Number(value || 0).toLocaleString("en-US", {
      style: "currency",
      currency: "USD"
    });
  }

  async function loadAll() {
    const res = await fetch("/api/bank/user-accounts/" + userId);
    const data = await res.json();

    if (data.ok) {
      setConnections(data.connections || []);

      const nextSelected: Record<number, number[]> = {};
      for (const connection of data.connections || []) {
        nextSelected[connection.id] = connection.accounts
          .filter((account: Account) => account.enabled)
          .map((account: Account) => account.id);
      }

      setSelected(nextSelected);
    }
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
      setMessage("Bank connected. Select the accounts to use, then click Save.");
      await loadAll();
    } catch {
      setMessage("Could not connect to CasellaIQ server.");
    } finally {
      setLoading(false);
    }
  }

  function toggleAccount(connectionId: number, accountId: number) {
    const current = selected[connectionId] || [];

    const next = current.includes(accountId)
      ? current.filter(id => id !== accountId)
      : [...current, accountId];

    setSelected({
      ...selected,
      [connectionId]: next
    });
  }

  async function saveConnection(connectionId: number) {
    await fetch("/api/bank/connection-accounts/" + connectionId, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountIds: selected[connectionId] || []
      })
    });

    setMessage("Account selection saved.");
    await loadAll();
  }

  async function syncConnection(connectionId: number) {
    setMessage("Syncing...");
    const res = await fetch("/api/bank/sync/" + connectionId, { method: "POST" });
    const data = await res.json();

    if (data.ok) {
      setMessage("Sync complete. Added " + data.inserted + " transactions.");
      await loadAll();
    } else {
      setMessage(data.message || "Sync failed.");
    }
  }

  useEffect(() => {
    loadAll();
  }, [userId]);

  return (
    <div className="bank-page">
      <div className="page-header">
        <div>
          <h2>🏦 Bank Connections</h2>
          <p>Connect banks and choose exactly which accounts this user can use.</p>
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

      {connections.map(connection => (
        <div className="bank-card" key={connection.id}>
          <h3>{connection.bankName}</h3>
          <p>{connection.provider} · {connection.lastSync || "Never synced"}</p>

          <h4>Accounts from this connection</h4>

          {connection.accounts.map(account => (
            <label className="account-row" key={account.id}>
              <input
                type="checkbox"
                checked={(selected[connection.id] || []).includes(account.id)}
                onChange={() => toggleAccount(connection.id, account.id)}
              />

              <div>
                <strong>{account.accountName}</strong>
                <p>{money(account.currentBalance)}</p>
              </div>
            </label>
          ))}

          <div className="bank-actions">
            <button className="primary-btn" onClick={() => saveConnection(connection.id)}>
              Save Account Selection
            </button>

            <button className="secondary-btn" onClick={() => syncConnection(connection.id)}>
              Sync Now
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
