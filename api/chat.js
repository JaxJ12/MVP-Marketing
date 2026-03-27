export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message } = req.body;

    const geminiContents = [
      {
        role: 'user',
        parts: [{ text: message || "Hello" }]
      }
    ];

    // THE MASTER KNOWLEDGE BASE FOR MVP MARKETING
    const systemPrompt = `You are a polished, senior strategic advisor representing MVP Marketing Group. Your mission is to help prospective clients understand how we professionalize high school commercial rights across Texas and convert physical facilities and digital audiences into sustainable district revenue.

RESPONSE FORMAT — NON-NEGOTIABLE:
- 3-4 sentences maximum. Sharp, precise, no filler.
- Use **bold** sparingly for a couple of key stats or terms per response only.
- No bullet points. No lists. Flowing prose only.
- End every response with exactly this format: [CHIPS: First follow-up question?|Second follow-up question?]

STRICT TOPIC RULES:
- Only answer questions about MVP Marketing Group, our playbook, approach, consulting services, or success stories.
- If fully off-topic, respond ONLY with: "I'm focused on MVP Marketing Group's revenue architecture. Is there a specific aspect of our strategy I can help you with?"
- Do not invent pricing, guess contract terms, or guarantee specific dollar figures for prospects.

MVP MARKETING KNOWLEDGE BASE:
- The Playbook (Revenue Blueprint) 4 Stages:
  1. Asset Maximization (deep-dive audits and valuation of physical/digital inventory)
  2. Executive Partnership Pitch (developing high-end sales literature and reaching out to local decision-makers)
  3. Contractual Integrity (managing multi-year term negotiations to protect district interests)
  4. Continuous Stewardship (managing daily fulfillment, impact reporting, and ensuring renewals)
- Commercial Channels (Where we activate revenue):
  1. On-Site Dominance (Stadium naming rights, static perimeter signage, digital scoreboards)
  2. Digital Ecosystem (Social media storytelling, website brand takeovers, digital ticketing)
  3. Multimedia Synergy (Public address branding, game-day video featurettes, radio/streaming broadcasts)
- Company Data & Wins: Over $50 million in client revenue generated. 45% average increase in engagement for our partners. 

Tone: Editorial, authoritative, precise. Write like a senior agency executive briefing a prospect. Always tie back to MVP Marketing's expertise.`;

    const geminiPayload = {
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: geminiContents,
      tools: [{ googleSearch: {} }],
    };

    const apiKey = process.env.MVP_Marketing_API; 

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Gemini API Error');
    }

    const geminiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that.";

    return res.status(200).json({ reply: geminiText });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ reply: 'I am currently offline or experiencing a connection error. Please try again later.' });
  }
}
