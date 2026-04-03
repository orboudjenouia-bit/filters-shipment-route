import { useState, useEffect } from "react";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, LogIn, Truck } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import ThemeToggle from "./ThemeToggle";
import "./Login.css";
import { login } from "./services/authService";

export default function Login({ onBack, onSuccess, onCreateAccount, onForgotPassword }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(""), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { showError("Please fill in all fields."); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) { showError("Please enter a valid email address."); return; }
    const passwordRegex = /^[A-Za-z0-9]{10,}$/;
    if (!passwordRegex.test(form.password)) {
      showError("Password must be at least 10 alphanumeric characters.");
      return;
    }

    try {
      setLoading(true); setError("");
      const data = await login(form.email, form.password);
      if (data.token) localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      showError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setSocialLoading("google");
        showError("Google login is not available yet.");
      } catch (err) {
        console.error(err);
        showError("Google login failed. Please try again.");
      } finally { setSocialLoading(""); }
    },
    onError: () => showError("Google login was cancelled."),
  });

  const handleAppleLogin = async () => {
    try {
      setSocialLoading("apple");
      showError("Apple login is not available yet.");
    } catch (err) {
      console.error(err);
      showError("Apple login was cancelled.");
    } finally { setSocialLoading(""); }
  };

  return (
    <div className="login-page">
      <div className={`login-card ${mounted ? "login-card--visible" : ""}`}>

        <div className="login-header">
          <button className="login-back" onClick={onBack} type="button">
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <h2 className="login-page-title">Login</h2>
          <ThemeToggle />
        </div>

        <div className="login-logo-wrap">
          <div className="login-logo-circle">
            <Truck size={30} color="#22c55e" strokeWidth={2} />
          </div>
          <h1 className="login-brand">Wesselli</h1>
        </div>

        <div className="login-welcome-wrap">
          <h3 className="login-welcome">Welcome back!</h3>
          <p className="login-sub">Sign in to start your delivery experience.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>

          <div className="login-field">
            <label className="login-label" htmlFor="email">Email Address</label>
            <div className="login-input-wrapper">
              <Mail size={16} className="login-input-icon" />
              <input id="email" type="email" placeholder="name@example.com"
                value={form.email} onChange={handleChange("email")} />
            </div>
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="password">Password</label>
            <div className="login-input-wrapper">
              <Lock size={16} className="login-input-icon" />
              <input id="password" type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={form.password} onChange={handleChange("password")} />
              <button type="button" className="login-eye"
                onClick={() => setShowPassword((p) => !p)}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="login-forgot-wrap">
            <button type="button" className="login-forgot" onClick={onForgotPassword}>
              Forgot Password?
            </button>
          </div>

          {error && <div className="login-msg-error">{error}</div>}

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
            {!loading && <LogIn size={18} />}
          </button>

          <div className="login-divider"><span>OR CONTINUE WITH</span></div>

          <div className="login-social-row">
            <button type="button" className="login-social-btn"
              onClick={() => handleGoogleLogin()} disabled={socialLoading === "google"}>
              {socialLoading === "google" ? "Loading..." : (
                <>
                  <svg viewBox="0 0 24 24" width={18} height={18}>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </>
              )}
            </button>
            <button type="button" className="login-social-btn"
              onClick={handleAppleLogin} disabled={socialLoading === "apple"}>
              {socialLoading === "apple" ? "Loading..." : (
                <>
                  <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.32.07 2.24.72 3.01.75.96-.19 1.87-.87 3.07-.93 1.53-.08 2.98.68 3.78 2.02-3.52 2.04-2.95 6.57.77 7.84-.46 1.17-.96 2.35-2.63 3.2zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Apple
                </>
              )}
            </button>
          </div>

          <p className="login-register">
            New to Wesselli?{" "}
            <button type="button" className="login-register-link" onClick={onCreateAccount}>
              Create an Account
            </button>
          </p>

        </form>
      </div>
    </div>
  );
}