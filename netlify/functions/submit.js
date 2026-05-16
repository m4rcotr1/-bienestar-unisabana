// Netlify serverless function — writes survey responses to Notion database 
// Environment variable required: NOTION_TOKEN (set in Netlify dashboard) 
const NOTION_DB_ID = "d4877174-3626-4ecc-bf4f-6dee93bd0e44"; 

exports.handler = async (event) => { 
 const headers = { 
 "Access-Control-Allow-Origin": "*", 
 "Access-Control-Allow-Methods": "POST, OPTIONS", 
 "Access-Control-Allow-Headers": "Content-Type", 
 "Content-Type": "application/json" 
 }; 

 if (event.httpMethod === "OPTIONS") { 
 return { statusCode: 200, headers, body: "" }; 
 } 
 if (event.httpMethod !== "POST") { 
 return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) }; 
 } 

 const NOTION_TOKEN = process.env.NOTION_TOKEN; 
 if (!NOTION_TOKEN) { 
 return { statusCode: 500, headers, body: JSON.stringify({ error: "NOTION_TOKEN not configured" }) }; 
 } 

 let payload; 
 try { 
 payload = JSON.parse(event.body); 
 } catch (e) { 
 return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) }; 
 } 

 const properties = {}; 

 // Title 
 if (payload["Respondente"]) { 
 properties["Respondente"] = { title: [{ text: { content: String(payload["Respondente"]).substring(0, 200) } }] }; 
 } 

 // Rich text 
 for (const f of ["Intereses","Objetivos","Perfil recibido","Recomendaciones completas", 
 "Programa académico","¿Por qué ese servicio?","Servicios no recomendados", 
 "¿Qué cambiarías?","Servicio que esperaba y no apareció"]) { 
 if (payload[f] && payload[f] !== "") { 
 properties[f] = { rich_text: [{ text: { content: String(payload[f]).substring(0, 2000) } }] }; 
 } 
 } 

 // Select 
 for (const f of ["Semestre","Estado emocional","Disponibilidad","Preferencia", 
 "Fuente BD","Top recomendación","Relevancia recomendaciones", 
 "Facilidad del cuestionario","¿Lo usarías antes de ir a Bienestar?", 
 "Servicio elegido","¿Lo recomendarías a amigos?"]) { 
 if (payload[f] && payload[f] !== "") { 
 properties[f] = { select: { name: String(payload[f]) } }; 
 } 
 } 

 // Number 
 if (payload["Confianza del modelo"] != null && payload["Confianza del modelo"] !== "") { 
 properties["Confianza del modelo"] = { number: Number(payload["Confianza del modelo"]) || 0 }; 
 } 
 if (payload["NPS (0-10)"] != null && payload["NPS (0-10)"] !== "") { 
 properties["NPS (0-10)"] = { number: Number(payload["NPS (0-10)"]) || 0 }; 
 } 

 try { 
 const resp = await fetch("https://api.notion.com/v1/pages", { 
 method: "POST", 
 headers: { 
 "Authorization": "Bearer " + NOTION_TOKEN, 
 "Content-Type": "application/json", 
 "Notion-Version": "2022-06-28" 
 }, 
 body: JSON.stringify({ parent: { database_id: NOTION_DB_ID }, properties }) 
 }); 
 const data = await resp.json(); 
 if (!resp.ok) { 
 console.error("Notion error:", JSON.stringify(data)); 
 return { statusCode: resp.status, headers, body: JSON.stringify({ error: data.message || "Notion error", code: data.code }) }; 
 } 
 return { statusCode: 200, headers, body: JSON.stringify({ success: true, id: data.id }) }; 
 } catch (err) { 
 console.error("Fetch error:", err.message); 
 return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) }; 
 } 
}; 
"agregas funcion de Notion"
