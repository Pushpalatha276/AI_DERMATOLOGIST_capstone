const express = require("express");
const cors = require("cors");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const { signup, login, getUserById } = require("./utils/auth");
const predictDisease = require("./utils/predictDisease");
const { addRecord, getHistoryForUser, exportHistoryForUser } = require("./utils/history");
const chatbot = require("./utils/chatbot");

const app = express();
const upload = multer();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => res.send("DermaScan API v5 OK"));

// Auth
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ success:false, message:"Missing fields" });
    const out = await signup({ name, email, password });
    res.json(out);
  } catch (e) { res.status(400).json({ success:false, message:e.message }); }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ success:false, message:"Missing fields" });
    const out = await login({ email, password });
    const token = jwt.sign({ uid: out.user.id, email: out.user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ success:true, token, user: out.user });
  } catch (e) { res.status(401).json({ success:false, message:e.message }); }
});

// Auth middleware
function requireAuth(req,res,next){
  const token=(req.headers.authorization||"").replace("Bearer ","");
  if(!token) return res.status(401).json({success:false,message:"Unauthorized"});
  try{ req.user=jwt.verify(token,JWT_SECRET); next(); }catch{ return res.status(401).json({success:false,message:"Invalid token"}); }
}

// Profile
app.get("/api/me", requireAuth, async (req,res)=>{
  const user = await getUserById(req.user.uid);
  res.json({ success:true, user });
});

// Analyze (protected) + store history
app.post("/api/analyze", requireAuth, upload.single("image"), async (req,res)=>{
  try{
    if(!req.file) return res.status(400).json({success:false,message:"No image provided"});
    const result = await predictDisease(req.file.buffer);
    const record = await addRecord(req.user.uid, result);
    res.json({success:true, ...result, record });
  }catch(e){ console.error(e); res.status(500).json({success:false,message:"Prediction error"}); }
});

// History endpoints
app.get("/api/history", requireAuth, async (req,res)=>{
  const items = await getHistoryForUser(req.user.uid);
  res.json({ success:true, items });
});

app.get("/api/history/export", requireAuth, async (req,res)=>{
  const json = await exportHistoryForUser(req.user.uid);
  res.setHeader("Content-Type","application/json");
  res.setHeader("Content-Disposition","attachment; filename=dermascan_history.json");
  res.send(json);
});

// Chatbot
app.post("/api/chat", async (req,res)=>{
  try{
    const { message } = req.body || {};
    const reply = await chatbot.handleMessage(message||"");
    res.json({ success:true, reply });
  }catch(e){ res.status(200).json({ success:true, reply: "Sorry, I couldn't process that." }); }
});

module.exports = app;
