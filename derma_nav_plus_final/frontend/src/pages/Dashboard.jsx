import React, { useState, useEffect } from "react";

const API = process.env.REACT_APP_API_URL;

export default function Dashboard({ onLogout, toggleTheme }) {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Fetch user info
  useEffect(() => {
    fetch(`${API}/api/me`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then((res) => res.json())
      .then(setUser)
      .catch(console.error);
  }, []);

  // Fetch History
  useEffect(() => {
    fetch(`${API}/api/history`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then((res) => res.json())
      .then(setHistory)
      .catch(console.error);
  }, []);

  // Upload + Analyze Image
  const analyze = async () => {
    if (!file) {
      alert("Please upload an image.");
      return;
    }

    setLoading(true);
    const fd = new FormData();
    fd.append("image", file);

    try {
      const res = await fetch(`${API}/api/analyze`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: fd
      });

      const data = await res.json();
      setResult(data);

      // Refresh history
      const hist = await fetch(`${API}/api/history`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setHistory(await hist.json());
    } catch (err) {
      console.error(err);
      alert("Analysis failed. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  // Export History
  const exportHistory = () => {
    window.open(`${API}/api/history/export?token=${localStorage.getItem("token")}`);
  };

  return (
    <div className="dashboard">
      <header>
        <h2>Welcome, {user?.name}</h2>
        <button onClick={toggleTheme}>Dark/Light Mode</button>
        <button onClick={onLogout}>Logout</button>
      </header>

      <section className="analyzer">
        <h3>Skin Disease Analyzer</h3>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button onClick={analyze} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        {result && (
          <div className="result-box">
            <h4>Prediction Result</h4>
            <p>Disease: {result.disease}</p>
            <p>Confidence: {result.confidence}%</p>
            <p>Symptoms: {result.symptoms}</p>
            <p>Precautions: {result.precautions}</p>
          </div>
        )}
      </section>

      <section className="history">
        <h3>Your Analysis History</h3>
        <button onClick={exportHistory}>Export as CSV</button>
        <ul>
          {history.map((h) => (
            <li key={h._id}>
              <strong>{h.disease}</strong> – {new Date(h.date).toLocaleString()}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
