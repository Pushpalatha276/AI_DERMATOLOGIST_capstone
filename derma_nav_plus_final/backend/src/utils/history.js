const path = require("path");
const fs = require("fs-extra");
const { v4: uuidv4 } = require("uuid");
const DB = path.join(__dirname, "..", "..", "data", "history.json");

async function readDB(){ try{ return JSON.parse(await fs.readFile(DB,'utf-8')); }catch{ return { records:[] }; } }
async function writeDB(db){ await fs.ensureFile(DB); await fs.writeFile(DB, JSON.stringify(db,null,2),'utf-8'); }

async function addRecord(userId, result){
  const db = await readDB();
  const rec = { id: uuidv4(), userId, key: result.key, prediction: result.prediction, confidence: result.confidence, createdAt: new Date().toISOString() };
  db.records.push(rec); await writeDB(db);
  return rec;
}
async function getHistoryForUser(userId){
  const db = await readDB();
  return db.records.filter(r=>r.userId===userId).sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));
}
async function exportHistoryForUser(userId){
  const items = await getHistoryForUser(userId);
  return JSON.stringify({ userId, items }, null, 2);
}

module.exports = { addRecord, getHistoryForUser, exportHistoryForUser };
