const path = require("path");
const fs = require("fs-extra");
const bcrypt = require("bcryptjs");
const DB_PATH = path.join(__dirname, "..", "..", "data", "users.json");

async function readDB(){ try{ return JSON.parse(await fs.readFile(DB_PATH,'utf-8')); }catch{ return { users:[] }; } }
async function writeDB(db){ await fs.ensureFile(DB_PATH); await fs.writeFile(DB_PATH, JSON.stringify(db,null,2),'utf-8'); }

async function signup({ name, email, password }){
  const db = await readDB();
  const exists = db.users.find(u=>u.email.toLowerCase()===email.toLowerCase());
  if(exists) throw new Error("Email already registered");
  const id = "u_" + Math.random().toString(36).slice(2,10);
  const hash = await bcrypt.hash(password, 10);
  const user = { id, name, email, password:hash, createdAt:new Date().toISOString() };
  db.users.push(user); await writeDB(db);
  return { success:true, user:{ id, name, email, createdAt:user.createdAt } };
}
async function login({ email, password }){
  const db = await readDB();
  const u = db.users.find(u=>u.email.toLowerCase()===email.toLowerCase());
  if(!u) throw new Error("Invalid credentials");
  const ok = await bcrypt.compare(password, u.password);
  if(!ok) throw new Error("Invalid credentials");
  return { success:true, user:{ id:u.id, name:u.name, email:u.email, createdAt:u.createdAt } };
}
async function getUserById(id){
  const db = await readDB();
  const u = db.users.find(u=>u.id===id);
  return u ? { id:u.id, name:u.name, email:u.email, createdAt:u.createdAt } : null;
}

module.exports = { signup, login, getUserById };
