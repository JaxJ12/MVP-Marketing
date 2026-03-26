// api/chat.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { message } = req.body;
  const apiKey = process.env.MVP_Marketing_API; // This matches your Vercel Key name

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ 
            text: `You are the MVP Marketing Advisor. 
            Context: MVP secures sponsorships for Texas high schools. 
            Leadership: Mike Vogelaar (CEO/Founder) & Drew Mitchell (Co-Founder). 
            Success: $420k generated for Denton ISD, 300% increase for Mesquite ISD. 
            Tiers: Bronze ($250/hr), Silver ($5k), Gold ($20k). 
            Tone: Professional, expert, helpful.
            User Message: ${message}` 
          }]
        }]
      })
    });

    const data = await response.json();
    const botReply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply: botReply });
  } catch (error) {
    res.status(500).json({ reply: "I'm having trouble connecting to the MVP knowledge base. Please try again or contact Mike directly." });
  }
}
