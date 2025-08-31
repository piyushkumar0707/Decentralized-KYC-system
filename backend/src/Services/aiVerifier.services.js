import axios from "axios"; // for HTTP calls

/*
 If GEMINI_API_KEY present, attempts to call Gemini (HTTP template included).
 If not present or call fails, falls back to simple rule-based checks (dev testing).
*/
const GEMINI_KEY = process.env.GEMINI_API_KEY || null;
const GEMINI_ENABLED = Boolean(GEMINI_KEY);//it will be only if Gemini ket will exist

async function callGeminiPrompt(prompt){
    const endpoint = process.env.GEMINI_ENDPOINT;
    const res = await axios.post() 
    
}    