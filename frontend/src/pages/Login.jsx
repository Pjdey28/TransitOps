import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bus } from "lucide-react";
import { request } from "../services/api";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "Fleet Manager"
};

export default function Login({ setAuth, notify }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const isSignup = mode === "signup";

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError("");
    setForm(emptyForm);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      const message = "Please enter your email and password.";
      setError(message);
      notify(message);
      return;
    }

    if (isSignup && !form.name) {
      const message = "Please enter your full name.";
      setError(message);
      notify(message);
      return;
    }

    try {
      const path = isSignup ? "/auth/register" : "/auth/login";
      const payload = isSignup
        ? { ...form, role: "Driver" }
        : { email: form.email, password: form.password };

      const data = await request(path, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setAuth(data.user);
      notify(isSignup ? "Account created" : "Logged in");
    } catch (err) {
      const message = isSignup
        ? err.message || "Could not create account. Please try again."
        : "No account found with this email/password. Please sign up first.";

      setError(message);
      notify(message);
    }
  };

  return (
    <div className="login">
      <motion.form
        className="authCard"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={submit}
      >
        <div className="logo big"><Bus /></div>

        <div className="authTitle">
          <p>Smart Transport Operations</p>
          <h1>{isSignup ? "Create account" : "Welcome back"}</h1>
        </div>

        <div className="authSwitch">
          <button
            type="button"
            className={!isSignup ? "selected" : ""}
            onClick={() => switchMode("login")}
          >
            Login
          </button>

          <button
            type="button"
            className={isSignup ? "selected" : ""}
            onClick={() => switchMode("signup")}
          >
            Signup
          </button>
        </div>

        {isSignup && (
          <input
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        )}

        <input
          placeholder="Email address"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {error && <div className="authError">{error}</div>}

        <button className="authSubmit">
          {isSignup ? "Create account" : "Login"}
        </button>
      </motion.form>
    </div>
  );
}