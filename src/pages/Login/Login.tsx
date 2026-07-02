import { useState } from "react";
import "./Login.css";

type LoginProps = {
  onLogin: (user: any, remember: boolean) => void;
};

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!data.ok) {
      setError(data.message || "Login failed.");
      return;
    }

    onLogin(data.user, remember);
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          Casella<span>IQ</span>
        </div>

        <p className="login-subtitle">
          Private financial command center
        </p>

        <label>Username or Email</label>
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          autoComplete="username"
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        <label className="remember-row">
          <input
            type="checkbox"
            checked={remember}
            onChange={e => setRemember(e.target.checked)}
          />
          Remember this device
        </label>

        {error && <div className="login-error">{error}</div>}

        <button type="submit" className="login-button">
          Sign In
        </button>

        <div className="login-links">
          <button
            type="button"
            className="link-button"
            onClick={() => alert("Password reset is coming soon.")}
          >
            Forgot Password?
          </button>

          <button
            type="button"
            className="link-button"
            onClick={() => alert("Account requests are currently handled by the administrator.")}
          >
            Request Access
          </button>

          <small>Private beta · Authorized users only</small>
        </div>
      </form>
    </div>
  );
}
