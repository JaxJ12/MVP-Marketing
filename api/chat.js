// api/chat.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { message } = req.body;
  const apiKey = process.env.MVP_Marketing_API;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ 
            text: `SYSTEM INSTRUCTIONS: You are the MVP Marketing Advisor. 
            CORE RULES: 
            1. ONLY discuss MVP Marketing Group, sports sponsorships, high school ad sales, and leadership (Mike Vogelaar/Drew Mitchell).
            2. If the user asks about ANYTHING ELSE (politics, coding, other companies, general trivia), politely refuse and pivot back to MVP.
            3. LIVE SEARCH: You have access to the web. Use it to find latest news about Texas high school athletics or sponsorship trends if asked.
            4. TONE: Professional, executive, and revenue-focused.
            USER MESSAGE: ${message}` 
          }]
        }],
        tools: [{ "google_search_retrieval": {} }] // Enables Live Web Search
      })
    });

    const data = await response.json();
    const botReply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply: botReply });
  } catch (error) {
    res.status(500).json({ reply: "I'm having trouble connecting. Please try again." });
  }
}
