// api/chat.js
export default async function handler(req, res) {
  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY; // Your key from Vercel Settings

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: `You are the MVP Marketing Advisor. Context: MVP secures sponsorships for high schools. Led by Mike Vogelaar & Drew Mitchell. Success: $420k for Denton ISD. Tiers: Bronze ($250/hr), Silver ($5k), Gold ($20k). Be professional and persuasive. User asks: ${message}` }]
      }]
    })
  });

  const data = await response.json();
  const botReply = data.candidates[0].content.parts[0].text;
  res.status(200).json({ reply: botReply });
}
