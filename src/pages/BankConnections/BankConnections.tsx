import "./BankConnections.css";

export function BankConnections() {
    return (
        <div className="bank-page">

            <div className="page-header">
                <div>
                    <h2>🏦 Bank Connections</h2>
                    <p>Manage your connected financial institutions.</p>
                </div>

                <button className="primary-btn">
                    + Add Bank
                </button>
            </div>

            <div className="bank-card">

                <div className="bank-title">
                    <div>
                        <h3>First Interstate Bank</h3>
                        <span className="connected">● Connected</span>
                    </div>

                    <button className="secondary-btn">
                        Sync Now
                    </button>
                </div>

                <hr />

                <div className="bank-grid">
                    <div>
                        <strong>Last Sync</strong>
                        <p>Never</p>
                    </div>

                    <div>
                        <strong>Accounts</strong>
                        <p>Waiting for first sync...</p>
                    </div>

                    <div>
                        <strong>Status</strong>
                        <p>Ready</p>
                    </div>
                </div>

            </div>

        </div>
    );
}
