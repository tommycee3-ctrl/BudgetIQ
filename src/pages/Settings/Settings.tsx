import "./Settings.css";

export function Settings() {
    return (
        <div className="settings-page">

            <h2>Settings</h2>

            <div className="settings-grid">

                <div className="settings-card">
                    <h3>👤 Profile</h3>
                    <p>Manage your account.</p>
                </div>

                <div className="settings-card">
                    <h3>🏦 Bank Connections</h3>
                    <p>Add and manage your banks.</p>
                </div>

                <div className="settings-card">
                    <h3>💳 Accounts</h3>
                    <p>Select which accounts CasellaIQ tracks.</p>
                </div>

                <div className="settings-card">
                    <h3>📅 Paychecks</h3>
                    <p>Manage recurring paychecks.</p>
                </div>

                <div className="settings-card">
                    <h3>🧾 Categories</h3>
                    <p>Merchant learning and budgeting categories.</p>
                </div>

                <div className="settings-card">
                    <h3>💾 Backups</h3>
                    <p>Create and restore backups.</p>
                </div>

            </div>

        </div>
    );
}
