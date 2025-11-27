import React, { useState } from 'react';
import axios from 'axios';

const SkinPredictor = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please upload an image first.');
      return;
    }
    setError('');
    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post('http://localhost:5000/api/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError('Error predicting image. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4">
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-md transition transform hover:scale-105">
        <h1 className="text-3xl font-semibold text-center text-blue-700 mb-6">
          Derma<span className="text-sky-500">Scan+</span>
        </h1>

        {/* Image Upload Section */}
        <div className="border-2 border-dashed border-blue-400 rounded-xl p-6 text-center bg-blue-50 hover:bg-blue-100 transition cursor-pointer">
          {preview ? (
            <img
              src={preview}
              alt="preview"
              className="w-full h-48 object-cover rounded-lg shadow-md mb-3"
            />
          ) : (
            <p className="text-blue-600 font-medium">
              Click to upload an image of the affected skin
            </p>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="fileInput"
            onChange={handleFileChange}
          />
          <label
            htmlFor="fileInput"
            className="mt-3 inline-block bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition"
          >
            {file ? 'Change Image' : 'Upload Image'}
          </label>
        </div>

        {/* Predict Button */}
        <button
          onClick={handleSubmit}
          className="mt-6 w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white py-3 rounded-full font-semibold hover:shadow-lg transition-all"
        >
          {loading ? 'Analyzing...' : 'Analyze Skin Condition'}
        </button>

        {/* Loading Animation */}
        {loading && (
          <div className="mt-4 flex justify-center">
            <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-red-600 text-center mt-3 font-medium">{error}</p>
        )}

        {/* Prediction Result */}
        {result && result.prediction && (
          <div className="mt-6 bg-gradient-to-r from-blue-100 to-sky-100 rounded-xl p-5 shadow-inner">
            <h2 className="text-2xl font-bold text-blue-700 text-center mb-2">
              {result.details?.disease || result.prediction}
            </h2>
            <p className="text-gray-700 text-sm mb-2">
              <span className="font-semibold text-gray-900">Description: </span>
              {result.details?.description}
            </p>
            <p className="text-gray-700 text-sm mb-2">
              <span className="font-semibold text-gray-900">Precautions: </span>
              {result.details?.precautions}
            </p>
            <p className="text-gray-700 text-sm">
              <span className="font-semibold text-gray-900">Cure: </span>
              {result.details?.cure}
            </p>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-500 mt-6">
        Powered by <span className="font-semibold text-blue-600">AI Dermatology Model</span>
      </p>
    </div>
  );
};

export default SkinPredictor;
