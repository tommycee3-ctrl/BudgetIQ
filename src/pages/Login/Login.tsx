import { USERS, type UserKey } from "../../types/app";
import "./Login.css";

type LoginProps = {
  onLogin: (user: UserKey) => void;
};

export function Login({ onLogin }: LoginProps) {
  return (
    <div className="login-screen">
      <div className="login-card">
        <h1>Budget<span>IQ</span></h1>
        <p>Choose your profile to continue.</p>

        <div className="login-users">
          <button onClick={() => onLogin("tommy")}>
            <strong>{USERS.tommy.name}</strong>
            <span>Dark blue dashboard</span>
          </button>

          <button className="ashley-login" onClick={() => onLogin("ashley")}>
            <strong>{USERS.ashley.name} 🦄</strong>
            <span>Pink and purple dashboard</span>
          </button>
        </div>

        <label className="remember">
          <input type="checkbox" defaultChecked />
          Remember this device
        </label>
      </div>
    </div>
  );
}

