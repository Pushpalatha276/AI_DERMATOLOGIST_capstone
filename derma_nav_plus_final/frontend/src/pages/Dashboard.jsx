import React, { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import Nav from "../components/Nav";
import Chatbot from "../components/Chatbot";
import diseaseDatabase from "../data/diseaseDatabase";

const API_URL = process.env.REACT_APP_API_URL || ""; // Safe fallback

/* ---------------------- ANALYZER COMPONENT ---------------------- */

function Analyzer() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [camOn, setCamOn] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const token = localStorage.getItem("token");

  const onFile = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    setResult(null);
    setError("");

    if (f) {
      setPreview(URL.createObjectURL(f));
    }
  };

  const startCam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCamOn(true);
    } catch (e) {
      setError(e.message);
    }
  };

  const stopCam = () => {
    const v = videoRef.current;
    if (v && v.srcObject) {
      v.srcObject.getTracks().forEach((t) => t.stop());
      v.srcObject = null;
    }
    setCamOn(false);
  };

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const v = videoRef.current;
    const c = canvasRef.current;

    c.width = v.videoWidth || 400;
    c.height = v.videoHeight || 400;

    c.getContext("2d").drawImage(v, 0, 0);

    c.toBlob(
      (blob) => {
        if (!blob) return;
        const f = new File([blob], "capture.jpg", { type: "image/jpeg" });
        setFile(f);
        setPreview(URL.createObjectURL(f));
      },
      "image/jpeg",
      0.95
    );
  };

  const analyze = async () => {
    if (!file) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const fd = new FormData();
      fd.append("image", file);

      const res = await fetch(`${API_URL}/api/analyze`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Prediction failed");
      }

      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Support both result.key and result.prediction
  const conditionKey =
    (result?.key && result.key.toLowerCase()) ||
    (result?.prediction && result.prediction.toLowerCase()) ||
    "normal skin";

  const info = diseaseDatabase[conditionKey] || null;

  return (
    <div className="card">
      <div className="grid">
        <section className="upload-card">
          <div className="big-icon">📷</div>
          <h3 style={{ marginTop: 14 }}>Upload Skin Image</h3>
          <p className="small">Drag and drop or click to select (JPG, PNG)</p>

          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <label className="btn primary">
              <input
                type="file"
                accept="image/*"
                onChange={onFile}
                style={{ display: "none" }}
              />
              Choose Image
            </label>

            <button className="btn" onClick={startCam} disabled={camOn}>
              Start Camera
            </button>

            <button className="btn" onClick={capture} disabled={!camOn}>
              Capture
            </button>

            <button className="btn" onClick={stopCam} disabled={!camOn}>
              Stop
            </button>
          </div>

          <video ref={videoRef} className="preview" style={{ marginTop: 12 }} />
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </section>

        <section>
          <h3>Preview & Analyze</h3>

          {preview ? (
            <img className="preview" src={preview} alt="preview" />
          ) : (
            <div className="small">No image chosen yet.</div>
          )}

          <div style={{ marginTop: 12 }}>
            <button className="btn primary" onClick={analyze} disabled={!file || loading}>
              {loading ? "Analyzing..." : "Analyze Image"}
            </button>
          </div>

          {error && (
            <div className="err" style={{ marginTop: 10 }}>
              Error: {error}
            </div>
          )}

          {result && (
            <div style={{ marginTop: 14 }}>
              <h3>Prediction: {result.prediction}</h3>
              <p className="small">
                Confidence: {(result.confidence * 100).toFixed(1)}%
              </p>

              {info && (
                <div className="small" style={{ marginTop: 10 }}>
                  <p>
                    <strong>Description:</strong> {info.description}
                  </p>
                  <p>
                    <strong>Precautions:</strong> {info.precautions}
                  </p>
                  <p>
                    <strong>Treatment:</strong> {info.cure}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="small" style={{ marginTop: 12 }}>
            <strong>Medical Disclaimer:</strong> Preliminary screening only; consult a dermatologist.
          </div>
        </section>
      </div>
    </div>
  );
}

/* ---------------------- HISTORY COMPONENT ---------------------- */

function History() {
  const [items, setItems] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (data.success) {
          setItems(data.items || []);
        }
      } catch (e) {
        console.error("History fetch error:", e);
      }
    })();
  }, []);

  /* 🔥 FIXED VERSION — Token included + works on Render */
  const exportJson = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/history/export`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        alert("Unauthorized or download failed.");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "history.json";
      a.click();
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>Your Analysis History</h3>
        <button className="btn primary" onClick={exportJson}>
          Download JSON
        </button>
      </div>

      <table className="table" style={{ marginTop: 10 }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Prediction</th>
            <th>Confidence</th>
          </tr>
        </thead>

        <tbody>
          {items.length > 0 ? (
            items.map((it) => (
              <tr key={it.id}>
                <td>{new Date(it.createdAt).toLocaleString()}</td>
                <td>{it.prediction}</td>
                <td>{(it.confidence * 100).toFixed(1)}%</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="small">
                No records yet. Analyze an image to see it here.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------------- PROFILE COMPONENT ---------------------- */

function Profile() {
  const [me, setMe] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (data.success) {
          setMe(data.user);
        }
      } catch (e) {
        console.error("Profile load error:", e);
      }
    })();
  }, []);

  return (
    <div className="card">
      <h3>Your Profile</h3>

      {me ? (
        <ul>
          <li>
            <strong>Name:</strong> {me.name}
          </li>
          <li>
            <strong>Email:</strong> {me.email}
          </li>
          <li>
            <strong>Joined:</strong> {new Date(me.createdAt).toLocaleString()}
          </li>
        </ul>
      ) : (
        <div className="small">Loading...</div>
      )}
    </div>
  );
}

/* ---------------------- ABOUT COMPONENT ---------------------- */

function About() {
  return (
    <div className="card">
      <h3>About DermaScan AI</h3>

      <p className="small">
        Final-year engineering project demo featuring AI-powered preliminary screening for skin conditions,
        real-time camera capture, and integrated guidance via a chatbot.
      </p>

      <h4 style={{ marginTop: 10 }}>FAQ</h4>

      <ul className="small">
        <li>
          <strong>Is this a medical diagnosis?</strong> No. It’s a screening tool only.
        </li>
        <li>
          <strong>How accurate is it?</strong> Heuristic by default; plug in a TFJS CNN model for higher accuracy.
        </li>
        <li>
          <strong>Where is my data stored?</strong> Locally in JSON files on the server for demo purposes.
        </li>
      </ul>
    </div>
  );
}

/* ---------------------- DASHBOARD MAIN COMPONENT ---------------------- */

export default function Dashboard({ onLogout, toggleTheme }) {
  const [tab, setTab] = useState("Dashboard");

  return (
    <>
      <Header authed={true} onLogout={onLogout} onToggleTheme={toggleTheme} />

      <div className="container">
        <section className="hero">
          <h1>AI-Powered Skin Analysis</h1>
          <p>
            Analyze images, review your history, manage your profile, and learn more — all from a single dashboard.
          </p>
        </section>

        <Nav current={tab} setCurrent={setTab} />

        {tab === "Dashboard" && <Analyzer />}
        {tab === "History" && <History />}
        {tab === "Profile" && <Profile />}
        {tab === "About" && <About />}
      </div>

      <Chatbot />
    </>
  );
}
