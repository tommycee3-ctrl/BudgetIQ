import "./Dashboard.css";

type DashboardProps = {
  userName: string;
  hasAmazonFlex: boolean;
  cardLabel: string;
};

export function Dashboard({ userName, hasAmazonFlex, cardLabel }: DashboardProps) {
  return (
    <div className="dashboard-page">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">CasellaIQ Command Center</p>
          <h2>Welcome back, {userName}</h2>
          <p>Your paycheck plan is healthy. Bills are covered and savings is on track.</p>
        </div>

        <div className="iq-score">
          <span>IQ Score</span>
          <strong>96</strong>
          <small>Excellent</small>
        </div>
      </section>

      <section className="stats-grid">
        <div className="metric"><p>Bills Remaining</p><h2>$415.00</h2><span>Unpaid bills only</span></div>
        <div className="metric"><p>Available to Save</p><h2>$499.60</h2><span>After bills and spending</span></div>
        <div className="metric"><p>Suggested Cushion</p><h2>$99.60</h2><span>Leave in checking</span></div>
        <div className="metric"><p>Suggested Transfer</p><h2>$400.00</h2><span>Safe savings goal</span></div>
      </section>

      <section className="two-col">
        <div className="panel">
          <h2>Next Paycheck</h2>
          <div className="countdown">
            <div><strong>7</strong><span>Days</span></div>
            <div><strong>13</strong><span>Hours</span></div>
            <div><strong>42</strong><span>Minutes</span></div>
          </div>
          <p>Paycheck #27 · $2,164.60 expected</p>
        </div>

        <div className="panel">
          <h2>{cardLabel}</h2>
          <div className="big-money">$250.00</div>
          <p>Budgeted spending balance</p>
        </div>
      </section>

      {hasAmazonFlex && (
        <section className="panel">
          <h2>Amazon Flex</h2>
          <p>No Flex income entered yet this paycheck.</p>
        </section>
      )}
    </div>
  );
}
