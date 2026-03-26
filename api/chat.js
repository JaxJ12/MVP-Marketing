// api/chat.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { message } = req.body;
  const apiKey = process.env.MVP_Marketing_API;

  if (!apiKey) {
    console.error("API Key is missing!");
    return res.status(500).json({ reply: "Server configuration error. Please check API keys." });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // 1. Official System Instructions placement (AI follows this strictly)
        systemInstruction: {
          parts: [{
            text: `You are the MVP Marketing Advisor. 
            CORE RULES: 
            1. ONLY discuss MVP Marketing Group, sports sponsorships, high school ad sales, and leadership (Mike Vogelaar/Drew Mitchell).
            2. If the user asks about ANYTHING ELSE (politics, coding, other companies, general trivia), politely refuse and pivot back to MVP.
            3. LIVE SEARCH: You have access to the web. Use it to find latest news about Texas high school athletics or sponsorship trends if asked.
            4. TONE: Professional, executive, and revenue-focused.`
          }]
        },
        // 2. Clean user message placement
        contents: [{
          role: "user",
          parts: [{ text: message }]
        }],
        // 3. Correct syntax for enabling Google Search
        tools: [
          { googleSearch: {} }
        ]
      })
    });

    const data = await response.json();

    // 4. Proper error parsing: catch API rejections gracefully
    if (!response.ok) {
      console.error("Gemini API Error:", data);
      return res.status(500).json({ reply: "I'm having trouble connecting. Please try again." });
    }

    // Safely extract the text from the successful response
    if (data.candidates && data.candidates.length > 0) {
      const botReply = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ reply: botReply });
    } else {
      return res.status(500).json({ reply: "I couldn't process a valid response. Please try again." });
    }

  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ reply: "I'm having trouble connecting. Please try again." });
  }
}
