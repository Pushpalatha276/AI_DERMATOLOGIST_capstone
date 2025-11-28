import React, { useEffect, useState } from "react";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import "./styles.css";

export default function App() {
  const [authed, setAuthed] = useState(!!localStorage.getItem("token"));
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setAuthed(!!localStorage.getItem("token"));
  }, []);

  useEffect(() => {
    document.documentElement.className = dark ? "dark" : "";
  }, [dark]);

  return authed ? (
    <Dashboard
      onLogout={() => {
        localStorage.removeItem("token");
        setAuthed(false);
      }}
      toggleTheme={() => setDark((d) => !d)}
    />
  ) : (
    <AuthPage
      onAuthed={() => setAuthed(true)}
      toggleTheme={() => setDark((d) => !d)}
    />
  );
}
