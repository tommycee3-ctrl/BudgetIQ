import { useEffect, useState } from "react";
import "./Dashboard.css";

type DashboardProps = {
  userId: number;
  userName: string;
  hasAmazonFlex: boolean;
  cardLabel: string;
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

export function Dashboard({
  userId,
  userName,
  hasAmazonFlex,
  cardLabel
}: DashboardProps) {

  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/dashboard/${userId}`);
      const json = await res.json();

      if (json.ok) {
        setData(json);
      }
    }

    load();
  }, [userId]);

  if (!data) {
    return <div className="panel">Loading dashboard...</div>;
  }

  const money = (n: number) =>
    n.toLocaleString("en-US", {
      style: "currency",
      currency: "USD"
    });

  return (
    <div className="dashboard-page">

      <section className="hero-panel">
        <div>
          <p className="eyebrow">CasellaIQ Command Center</p>

          <h2>Welcome back, {userName}</h2>

          <p>
            Current Pay Period
            <br />
            {data.payPeriod.lastPayday} → {data.payPeriod.nextPayday}
          </p>
        </div>

        <div className="iq-score">
          <span>Payday</span>
          <strong>{data.payPeriod.daysUntilPayday}</strong>
          <small>Days Left</small>
        </div>
      </section>

      <section className="stats-grid">

        <div className="metric">
          <p>Checking</p>
          <h2>{money(data.accounts.checkingBalance)}</h2>
          <span>{data.accounts.count} connected accounts</span>
        </div>

        <div className="metric">
          <p>{cardLabel}</p>
          <h2>{money(data.accounts.spendingCardBalance)}</h2>
          <span>Dedicated spending account</span>
        </div>

        <div className="metric">
          <p>Bills Remaining</p>
          <h2>{money(data.bills.remaining)}</h2>
          <span>{data.bills.count} bills left</span>
        </div>

        <div className="metric">
          <p>This Pay Period</p>
          <h2>{money(data.spending.currentPeriod)}</h2>
          <span>Spent so far</span>
        </div>

        <div className="metric">
          <p>Safe To Spend</p>
          <h2>{money(data.recommendations.safeToSpend)}</h2>
          <span>Available today</span>
        </div>

        <div className="metric">
          <p>Safe To Save</p>
          <h2>{money(data.recommendations.safeToSave)}</h2>
          <span>Can move to savings</span>
        </div>

      </section>

      {hasAmazonFlex && (
        <section className="panel">
          <h2>Amazon Flex</h2>

          <p>
            One Flex block can be compared against remaining bills and
            Safe To Spend in a future update.
          </p>
        </section>
      )}

    </div>
  );
}