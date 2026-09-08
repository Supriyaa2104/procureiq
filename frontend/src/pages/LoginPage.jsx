import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./LoginPage.css";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-center">
        <div className="login-card">
          <div className="login-form-wrap">
            <div className="login-brand-mark">
              <div className="login-brand-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18" />
                  <path d="M7 14l4-4 3 3 5-6" />
                </svg>
              </div>
              <span className="login-brand-name">ProcureIQ</span>
            </div>

            <h1>Welcome back</h1>
            <p className="login-subtitle">Sign in to your ProcureIQ account</p>

            <form onSubmit={handleSubmit}>
              <div className="login-field">
                <label>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="login-field">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <div className="login-error">⚠ {error}</div>}

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? "Logging in..." : "Log In"}
              </button>
            </form>

            <p className="login-footer">ProcureIQ — Procurement Intelligence Platform</p>
          </div>
        </div>
      </div>
    </div>
  );
}