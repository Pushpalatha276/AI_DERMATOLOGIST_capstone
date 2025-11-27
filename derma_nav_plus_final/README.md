
# DermaScan AI — Final-Year Project Edition (Nav + History + Chatbot + Auth + Analyzer)

## Highlights
- **Navigation bar**: Dashboard / History / Profile / About
- **Auth**: Signup + Login with JWT
- **Analyzer**: Camera capture + local upload + prediction
- **History**: Auto-saves each analysis per user; export as JSON
- **Profile**: View name, email, joined date
- **Chatbot**: Login/usage/disease FAQs
- **Theme**: Light/Dark toggle
- **Backend**: Node/Express; JSON storage; optional TFJS model

## Run
### Backend
```bash
cd backend
npm install
npm start
```
(Optional) set a stronger secret:
- Windows: `setx JWT_SECRET "change_me"`
- macOS/Linux: `export JWT_SECRET="change_me"`

### Frontend
```bash
cd frontend
npm install
npm start
```
The frontend proxies to `http://localhost:5000`.
