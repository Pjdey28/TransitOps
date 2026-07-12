import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bus } from "lucide-react";
import { request } from "../services/api";

export default function Login({ setAuth, notify }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Fleet Manager" });

  const isSignup = mode === "signup";

  const submit = async (e) => {
    e.preventDefault();
    try {
      const path = isSignup ? "/auth/register" : "/auth/login";
      const payload = isSignup ? form : { email: form.email, password: form.password };
      
      const data = await request(path, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setAuth(data.user);
      notify(isSignup ? "Account created" : "Logged in");
    } catch (err) {
      notify(err.message);
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
          <button type="button" className={!isSignup ? "selected" : ""} onClick={() => setMode("login")}>Login</button>
          <button type="button" className={isSignup ? "selected" : ""} onClick={() => setMode("signup")}>Signup</button>
        </div>

        {isSignup && <input placeholder="Full name" onChange={(e) => setForm({...form, name: e.target.value})} />}
        <input placeholder="Email address" type="email" onChange={(e) => setForm({...form, email: e.target.value})} />
        <input placeholder="Password" type="password" onChange={(e) => setForm({...form, password: e.target.value})} />
        
        {isSignup && (
          <select onChange={(e) => setForm({...form, role: e.target.value})}>
            <option>Fleet Manager</option>
            <option>Driver</option>
            <option>Safety Officer</option>
            <option>Financial Analyst</option>
          </select>
        )}

        <button className="authSubmit">{isSignup ? "Create account" : "Login"}</button>
      </motion.form>
    </div>
  );
}