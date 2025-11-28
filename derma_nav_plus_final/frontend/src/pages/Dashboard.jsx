import React, { useState } from "react";

const Analyzer = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const API = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");

  const handleFileChange = (e) => {
    const img = e.target.files[0];
    setFile(img);
    setPreview(URL.createObjectURL(img));
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const fd = new FormData();
      fd.append("image", file);

      const res = await fetch(`${API}/api/analyze`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: fd
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Prediction failed");

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="analyzer-container">
      <h2 className="title">Skin Disease Analyzer</h2>

      <div className="upload-section">
        <input type="file" accept="image/*" onChange={handleFileChange} />

        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="preview-image"
          />
        )}

        <button onClick={analyze} disabled={loading} className="analyze-btn">
          {loading ? "Analyzing..." : "Analyze Skin"}
        </button>

        {error && <p className="error-text">{error}</p>}
      </div>

      {result && (
        <div className="result-box">
          <h3>Prediction Result</h3>
          <p><strong>Disease:</strong> {result.prediction}</p>
          <p><strong>Confidence:</strong> {(result.confidence * 100).toFixed(2)}%</p>

          <h4>Recommendation:</h4>
          <p>{result.recommendation}</p>
        </div>
      )}
    </div>
  );
};

export default Analyzer;
