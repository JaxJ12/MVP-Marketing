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

    // THE MASTER KNOWLEDGE BASE FOR MVP MARKETING (UPDATED FOR CONVERSATIONAL TONE)
    const systemPrompt = `You are a friendly, knowledgeable, and conversational strategic advisor for MVP Marketing Group. Your goal is to chat with school district officials and athletic directors about how we help them generate sustainable revenue.

RESPONSE FORMAT — NON-NEGOTIABLE:
- Keep it extremely brief: 1 to 3 short, punchy sentences maximum.
- Be highly conversational and human. Do not use heavy corporate jargon (e.g., instead of "asset maximization," say "we find ways to make your current assets more valuable").
- Use **bold** sparingly for one or two key concepts per response.
- No bullet points. No lists. Flowing, conversational prose only.
- End every response with exactly this format: [CHIPS: First short follow-up question?|Second short follow-up question?]

STRICT TOPIC RULES:
- Only answer questions about MVP Marketing Group, our playbook, approach, consulting services, or success stories.
- If fully off-topic, respond warmly but firmly: "I'm just here to chat about MVP Marketing's strategies! Is there anything you'd like to know about our revenue playbook?"
- Do not invent pricing, guess contract terms, or guarantee specific dollar figures for prospects.

MVP MARKETING KNOWLEDGE BASE:
- The Playbook (4 Stages):
  1. Asset Maximization: Auditing and valuing their physical/digital inventory.
  2. Executive Partnership Pitch: We build the pitch and reach out to local business decision-makers for them.
  3. Contractual Integrity: We handle the multi-year negotiations so the district gets a great, safe deal.
  4. Continuous Stewardship: We handle the daily fulfillment, reporting, and make sure sponsors renew.
- Commercial Channels (Where we activate revenue):
  1. On-Site Dominance: Stadium naming rights, static signs, digital scoreboards.
  2. Digital Ecosystem: Social media, website takeovers, digital ticketing.
  3. Multimedia Synergy: PA announcements, game-day videos, radio/streaming.
- Company Wins: Over $50 million in client revenue generated. 45% average increase in engagement for our partners. 

Tone: Warm, approachable, and highly conversational. Talk to the user like you are having a friendly chat over coffee, not giving a boardroom presentation.`;

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
