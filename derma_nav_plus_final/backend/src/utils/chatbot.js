const diseaseDB = require("./staticDiseaseDb");
function normalize(s){ return (s||" ").toLowerCase().trim(); }
const helpText = `I can help with:
• Creating an account (signup) and logging in
• Using the camera or file upload
• Understanding predictions (melanoma, eczema, psoriasis, acne, rosacea, basal cell carcinoma, normal skin)
• Viewing your history and exporting it from the dashboard`;

async function handleMessage(msg){
  const q = normalize(msg);
  if(!q) return "Hi! Ask me about login, camera/upload, diseases, or history.";

  if(q.includes("sign up")||q.includes("signup")||q.includes("create account")) return "To sign up: fill Name, Email, Password → 'Sign up & Continue'.";
  if(q.includes("log in")||q.includes("login")) return "Enter your email and password → 'Log in'.";
  if(q.includes("history")||q.includes("export")) return "Go to History (navigation bar). You can export as JSON using 'Download JSON'.";
  if(q.includes("camera")||q.includes("webcam")) return "Use 'Start Camera' → 'Capture'. Or use 'Choose Image' to upload.";
  if(q.includes("upload")||q.includes("file")) return "Select a clear JPG/PNG close-up → 'Analyze Image'.";
  if(q.includes("confidence")) return "Confidence reflects model certainty. This demo uses heuristics unless a TFJS model is provided.";

  for(const key of Object.keys(diseaseDB)){
    if(q.includes(key) || q.includes(diseaseDB[key].disease.toLowerCase())){
      const d=diseaseDB[key];
      return `**${d.disease}**\nDescription: ${d.description}\nPrecautions: ${d.precautions}\nTreatment: ${d.cure}`;
    }
  }
  if(q.includes("help")||q.includes("how")) return helpText;
  return "I'm here to help with login, analyzer, diseases, and history. " + helpText;
}
module.exports = { handleMessage };
