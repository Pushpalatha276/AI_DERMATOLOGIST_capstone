import React, { useState } from "react";
import Header from "../components/Header";
import Chatbot from "../components/Chatbot";

// Use API URL from .env
const API_URL = process.env.REACT_APP_API_URL;

export default function AuthPage({ onAuthed, toggleTheme }) {
  const [isSignup, setIsSignup] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Signup request
      if (isSignup) {
        const res = await fetch(`${API_URL}/api/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Signup failed");
      }

      // Login request
      const res2 = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data2 = await res2.json();
      if (!data2.success) throw new Error(data2.message || "Login failed");

      // Save token & call onAuthed
      localStorage.setItem("token", data2.token);
      onAuthed(data2.user);

    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <Header authed={false} onToggleTheme={toggleTheme} />
      <div className="container">
        <section className="hero">
          <h1>AI-Powered Skin Analysis</h1>
          <p>
            Upload an image of your skin condition for preliminary screening
            and intelligent insights powered by advanced AI.
          </p>
        </section>

        <div className="card" style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ display: "grid", gap: 12 }}>
            {isSignup && (
              <input
                className="input"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <input
              className="input"
              placeholder="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="input"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="btn primary" onClick={submit}>
              {isSignup ? "Sign up & Continue" : "Log in"}
            </button>

            {error && <div className="err">Error: {error}</div>}

            <div className="small">
              {isSignup ? "Already have an account?" : "New here?"}{" "}
              <span
                className="link"
                onClick={() => setIsSignup(!isSignup)}
              >
                {isSignup ? "Log in" : "Create an account"}
              </span>
            </div>
          </div>
        </div>
      </div>
      <Chatbot />
    </>
  );
}
