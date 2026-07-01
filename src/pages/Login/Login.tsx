import { useState } from "react";
import "./Login.css";

type LoginUser = {
  id: number;
  name: string;
  username: string;
  theme: "tommy" | "ashley";
  hasAmazonFlex: boolean;
};

type LoginProps = {
  onLogin: (user: LoginUser, remember: boolean) => void;
};

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("tommy");
  const [password, setPassword] = useState("tommy123");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitLogin(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.message || "Login failed.");
        return;
      }

      onLogin(data.user, remember);
    } catch {
      setError("Could not reach the CasellaIQ server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={submitLogin}>
        <h1>Casella<span>IQ</span></h1>
        <p>Sign in to your personal finance dashboard.</p>

        <label>Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} />

        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        {error && <div className="login-error">{error}</div>}

        <label className="remember">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          Remember this device
        </label>

        <button className="login-submit" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>

        <div className="login-hint">
          Tommy: tommy / tommy123<br />
          Ashley: ashley / ashley123
        </div>
      </form>
    </div>
  );
}
