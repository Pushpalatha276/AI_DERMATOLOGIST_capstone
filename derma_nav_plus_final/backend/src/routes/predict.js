
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/predict', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const form = new FormData();
    form.append('image', fs.createReadStream(req.file.path));
    const response = await axios.post('http://localhost:5001/predict', form, {
      headers: form.getHeaders(),
      timeout: 20000
    });
    // delete uploaded temp file
    fs.unlink(req.file.path, () => {});
    return res.json(response.data);
  } catch (err) {
    console.error('Error calling ML service', err.message || err);
    return res.status(500).json({ error: 'Prediction failed', detail: err.message });
  }
});

module.exports = router;
