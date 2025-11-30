 🩺 AI Dermatologist – Skin Disease Detection (React + Node.js + Python CNN)

This project is an AI-powered dermatologist system that predicts skin diseases from images, provides explanations, and stores user history. It uses:

* React (Frontend)
* Node.js + Express (Backend API)
* Python (Flask) Machine Learning model
* JSON files for storing users & history (no MongoDB)

---

##  Features

* Upload or capture skin images using camera
* Predict 7+ skin disease classes using CNN model
* Show disease details and suggestions
* Simple login & signup (stored in JSON)
* History tracking for every prediction
* Fully deployed on Render (Frontend + Backend)

---

#  Project Structure

```
derma_nav_plus_final/
│
├── backend/          # Node.js API
│   ├── data/
│   │   ├── users.json
│   │   ├── history.json
│   ├── src/
│   ├── .env
│   ├── package.json
│
├── frontend/         # React UI
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── data/diseaseDatabase.js
│   ├── public/
│   ├── .env
│   ├── package.json
│
├── ml/               # Python ML Model
│   ├── app.py
│   ├── predict.py
│   ├── cnn_skin_classifier.h5
│   ├── labels.json
│
└── reference_dataset/  # Model training images
```

---

#  Tech Stack

* **Frontend**: React, Axios
* **Backend**: Node.js, Express, JSON file database
* **ML Model**: Python, TensorFlow/Keras CNN
* **Deployment**: Render (Free Tier)

---

#  How to Run Locally

### 1️ Clone the repo

```bash
git clone https://github.com/Pushpalatha276/AI_DERMATOLOGIST_capstone.git
cd AI_DERMATOLOGIST_capstone/derma_nav_plus_final
```

---

##  Backend Setup (Node.js)

```bash
cd backend
npm install
npm start
```

Create `.env` file:

```
JWT_SECRET=your_secret
```

Backend runs at:

```
http://localhost:5000
```

---

##  Frontend Setup (React)

```bash
cd frontend
npm install
npm start
```

Create `.env` file:

```
REACT_APP_API_URL=http://localhost:5000
```

Frontend runs at:

```
http://localhost:3000
```

---

##  ML Model (Python)

Only needed if you retrain the model:

```bash
cd ml
pip install -r requirements.txt   # if available
python app.py
```

---

#  Deployment on Render

This project uses **two Render services**:

---

## 1  FRONTEND – React

**Root Directory:**

```
derma_nav_plus_final/frontend
```

**Build Command:**

```
npm install && npm run build
```

**Start Command:**

```
npx serve -s build
```

**Frontend Environment Variable:**

```
REACT_APP_API_URL=https://ai-dermatologist-capstone.onrender.com
```

Frontend URL:
✔ [https://ai-dermatologist-frontend.onrender.com](https://ai-dermatologist-frontend.onrender.com)

---

## 2️ BACKEND – Node.js

**Root Directory:**

```
derma_nav_plus_final/backend
```

**Build Command:**

```
npm install
```

**Start Command:**

```
npm start
```

**Backend Environment Variable:**

```
JWT_SECRET=your_secret
```

Backend URL:
✔ [https://ai-dermatologist-capstone.onrender.com](https://ai-dermatologist-capstone.onrender.com)

---

#  How It Works

1. User uploads a skin image
2. Frontend sends image → backend
3. Backend forwards image → Python ML model
4. CNN model predicts disease
5. Backend adds result into `history.json`
6. Response is shown to user in UI

---

#  Predictable Disease Classes

* Acne
* Rosacea
* Melanoma
* Eczema
* Basal Cell Carcinoma
* Psoriasis
* Normal Skin

---

#  License

This project is for **educational and research purposes**.

---

