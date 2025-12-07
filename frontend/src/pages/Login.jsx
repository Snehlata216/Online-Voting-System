// src/pages/Login.jsx
import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import "./Login.css";

export default function Login() {
  const { setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("voter");
  const [status, setStatus] = useState("");
  const [banner, setBanner] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const [pwStrength, setPwStrength] = useState({ score: 0, label: "Too short" });

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const eyeBtnRef = useRef(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  useEffect(() => {
    setPwStrength(calcPasswordStrength(password));
  }, [password]);

  // small client-side password strength heuristic
  function calcPasswordStrength(pw) {
    if (!pw || pw.length < 6) return { score: 0, label: "Too short" };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const labels = ["Weak", "Fair", "Good", "Strong", "Excellent"];
    return { score, label: labels[Math.min(score, labels.length - 1)] };
  }

  const validateEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    if (!validateEmail(email)) {
      setStatus("Please enter a valid email address.");
      emailRef.current?.focus();
      return;
    }
    if (!password) {
      setStatus("Please enter your password.");
      passwordRef.current?.focus();
      return;
    }

    setLoading(true);
    setStatus("Signing in...");

    try {
      const endpoint =
        role === "admin"
          ? "http://localhost:5000/api/admins/login"
          : "http://localhost:5000/api/voters/login";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!res.ok) {
        const errMsg = await res.text();
        setStatus(errMsg || "Invalid credentials");
        setLoading(false);
        return;
      }

      const data = await res.json();

      const user =
        role === "voter"
          ? {
              name: data.voter?.name || data.voter?.fullName || "Voter",
              role: "voter",
              voterId: data.voter?.voterId,
              email: data.voter?.email || email.trim(),
            }
          : {
              name: data.admin?.name || data.admin?.fullName || "Admin",
              role: "admin",
              email: data.admin?.email || email.trim(),
            };

      setAuth(user);
      if (remember) localStorage.setItem("app_user", JSON.stringify(user));
      else localStorage.removeItem("app_user");

      setBanner(`Welcome back, ${user.name}`);
      setTimeout(() => setBanner(""), 3500);

      setLoading(false);
      if (user.role === "voter") navigate("/profile", { replace: true });
      else if (user.role === "admin") navigate("/dashboard", { replace: true });
      else navigate("/", { replace: true });
    } catch (err) {
      console.error("Login failed:", err);
      setStatus("Login failed. Please try again.");
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword((s) => !s);
    // keep focus on the password input after toggling
    setTimeout(() => passwordRef.current?.focus(), 0);
  };

  return (
    <main className="login-page">
      {banner && <div className="login-banner" role="status">{banner}</div>}

      <section className="login-card card" aria-labelledby="login-heading">
        <h2 id="login-heading" className="login-title">Sign In to Online Voting</h2>

        <p className="login-sub">Access your account to vote or manage election</p>

        {status && <div className="status-msg" role="alert">{status}</div>}

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <label className="field">
            <span className="field-label">Email</span>
            <input
              ref={emailRef}
              type="email"
              inputMode="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
              aria-invalid={email && !validateEmail(email)}
            />
          </label>

          <label className="field password-field">
            <span className="field-label">Password</span>
            <div className="password-row">
              <input
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
                aria-describedby="pw-strength"
              />
              <button
                ref={eyeBtnRef}
                type="button"
                className={`eye-btn ${showPassword ? "active" : ""}`}
                onClick={toggleShowPassword}
                aria-pressed={showPassword}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
              >
                <span className="eye-icon" aria-hidden>{showPassword ? "🙈" : "👁️"}</span>
              </button>
            </div>

            <div id="pw-strength" className={`pw-strength s-${pwStrength.score}`}>
              <span className="pw-label">{pwStrength.label}</span>
              <div className="pw-bar" aria-hidden>
                <span style={{ width: `${(pwStrength.score / 4) * 100}%` }} />
              </div>
            </div>
          </label>

          <div className="row role-remember">
            <div className="role-picker" role="radiogroup" aria-label="Select role">
              <label className={`role ${role === "voter" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="role"
                  value="voter"
                  checked={role === "voter"}
                  onChange={() => setRole("voter")}
                />
                Voter
              </label>
              <label className={`role ${role === "admin" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={role === "admin"}
                  onChange={() => setRole("admin")}
                />
                Admin
              </label>
            </div>

            <label className="remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>
          </div>

          <div className="actions">
            <button
              type="submit"
              className="login-btn primary"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? <span className="spinner" aria-hidden /> : "Login"}
            </button>

            <button
              type="button"
              className="login-btn link"
              onClick={() => navigate("/register")}
            >
              Create account
            </button>
          </div>
        </form>

        <div className="help-row">
          <a href="/forgot-password" className="help-link">Forgot password?</a>
          <span className="sep">•</span>
          <a href="/help" className="help-link">Need help?</a>
        </div>
      </section>
    </main>
  );
}
