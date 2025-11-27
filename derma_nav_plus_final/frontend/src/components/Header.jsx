
import React from "react";
export default function Header({ onLogout, authed, onToggleTheme }){
  return (
    <header className="header">
      <div className="brand">
        <div className="logo">🩺</div>
        <div>DermaScan <span style={{color:"var(--primary)"}}>AI</span></div>
      </div>
      <div className="right">
        <button className="btn" onClick={onToggleTheme}>Theme</button>
        {authed ? <button className="btn" onClick={onLogout}>Logout</button> : null}
      </div>
    </header>
  );
}
