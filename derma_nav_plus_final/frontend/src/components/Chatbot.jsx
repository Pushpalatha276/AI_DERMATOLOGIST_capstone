import React, { useEffect, useRef, useState } from "react";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    {
      from: "bot",
      text: "Hi! I can help with signup/login, camera/upload, history, and disease info.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [msgs, open]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;

    // Add user message
    setMsgs((m) => [...m, { from: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      // Use backend URL from environment variable
      const backendURL = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const res = await fetch(`${backendURL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      setMsgs((m) => [...m, { from: "bot", text: data.reply || "Hmm, not sure." }]);
    } catch (e) {
      setMsgs((m) => [...m, { from: "bot", text: "Sorry, server unreachable." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="chat-trigger" title="Help" onClick={() => setOpen((o) => !o)}>
        💬
      </button>

      {open && (
        <div className="chat-panel">
          <div className="chat-header">DermaScan Assistant</div>

          <div className="chat-body" ref={bodyRef}>
            {msgs.map((m, i) => (
              <div key={i} className={"chat-msg " + (m.from === "user" ? "user" : "bot")}>
                <div className="bubble">{m.text}</div>
              </div>
            ))}

            {loading && (
              <div className="chat-msg bot">
                <div className="bubble">Typing...</div>
              </div>
            )}
          </div>

          <div className="chat-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a question..."
            />
            <button onClick={send}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}
