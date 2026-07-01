import { useEffect, useState } from "react";
import "./BankConnections.css";

type BankConnection = {
  id: number;
  provider: string;
  friendlyName: string;
  lastSync: string | null;
  enabled: number;
};

type BankAccount = {
  id: number;
  connectionId: number;
  externalId: string;
  accountName: string;
  accountType: string | null;
  enabled: boolean;
};

type BankConnectionsProps = {
  userId: number;
};

export function BankConnections({ userId }: BankConnectionsProps) {
  const [connections, setConnections] = useState<BankConnection[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [friendlyName, setFriendlyName] = useState("First Interstate Bank");
  const [setupToken, setSetupToken] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadConnections() {
    const res = await fetch(`/api/bank/status/${userId}`);
    const data = await res.json();

    if (data.ok) {
      setConnections(data.connections ?? []);
    }
  }

  async function connectBank() {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/bank/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          setupToken,
          friendlyName
        })
      });

      const data = await res.json();

      if (!data.ok) {
        setMessage(data.message || "Connection failed.");
        return;
      }

      setAccounts(data.accounts ?? []);
      setSetupToken("");
      setMessage("Bank connected successfully.");
      await loadConnections();
    } catch {
      setMessage("Could not connect to CasellaIQ server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadConnections();
  }, []);

  return (
    <div className="bank-page">
      <div className="page-header">
        <div>
          <h2>🏦 Bank Connections</h2>
          <p>Connect your bank and choose which accounts CasellaIQ should track.</p>
        </div>
      </div>

      <div className="bank-card">
        <h3>Connect Bank</h3>

        <label>Bank Name</label>
        <input value={friendlyName} onChange={(e) => setFriendlyName(e.target.value)} />

        <label>Secure Connection Code</label>
        <textarea
          value={setupToken}
          onChange={(e) => setSetupToken(e.target.value)}
          placeholder="Paste your secure connection code here"
        />

        <button className="primary-btn" onClick={connectBank} disabled={loading || !setupToken}>
          {loading ? "Connecting..." : "Connect Bank"}
        </button>

        {message && <p className="bank-message">{message}</p>}
      </div>

      <div className="bank-card">
        <h3>Connected Banks</h3>

        {connections.length === 0 && <p>No banks connected yet.</p>}

        {connections.map((connection) => (
          <div className="connection-row" key={connection.id}>
            <div>
              <strong>{connection.friendlyName}</strong>
              <p>{connection.provider} · {connection.lastSync || "Never synced"}</p>
            </div>
            <span className="connected">● Connected</span>
          </div>
        ))}
      </div>

      {accounts.length > 0 && (
        <div className="bank-card">
          <h3>Imported Accounts</h3>

          {accounts.map((account) => (
            <div className="account-row" key={account.id}>
              <input type="checkbox" defaultChecked={account.enabled} />
              <div>
                <strong>{account.accountName}</strong>
                <p>{account.accountType || "Account"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
