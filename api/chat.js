export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages } = req.body;

    // 1. Convert Anthropic's message format to Gemini's format
    const geminiContents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content) }]
    }));

    // 2. Your exact system prompt (UPDATED FOR MVP MARKETING)
    const systemPrompt = `You are a polished, senior advisor representing MVP Marketing Group in a pitch to prospective clients. Your tone is confident, editorial, and authoritative — like a seasoned executive, not a chatbot.

RESPONSE FORMAT — NON-NEGOTIABLE:
- 3-4 sentences maximum. Sharp, precise, no filler.
- Use **bold** sparingly for a couple of key stats or terms per response only.
- No bullet points. No lists. Flowing prose only.
- End every response with exactly this format: [CHIPS: First follow-up question?|Second follow-up question?]
- Follow-up questions must be specific and drill deeper into what was just discussed.

STRICT TOPIC RULES:
- Only answer questions about MVP Marketing Group.
- Relevant comparisons allowed (Sponsorships, deals, relevant sports news, partners) only when tied back to MVP Marketing.
- Skip off-topic prerequisites — answer only the relevant part.
- If fully off-topic respond ONLY with: "I'm focused on MVP Marketing. Is there something I can help you with?"

MVP MARKETING CORE SERVICES:
1. Brand Strategy - We provide data-driven brand positioning and identity design to help brands stand out.
2. Digital & Social Media - We execute targeted paid media campaigns and foster organic community growth.
3. Experiential & Sponsorships - We manage live event activations and strategic partnership management.
4. Creative Production - We deliver high-converting video and graphic design tailored to your audience.

KEY VALUE PROPOSITION:
We bridge the gap between brands and their target audience through ROI-focused, authentic marketing campaigns.

COMPANY DATA & WINS:
- Over $50 million in client revenue generated.
- 45% average increase in engagement for our partners.
- Notable Clients/Partners: [Insert Client 1], [Insert Client 2], [Insert Client 3]

TARGET AUDIENCE:
Mid-market to enterprise brands looking to scale their digital footprint and maximize sponsorship ROI.

Tone: Editorial, authoritative, precise. Write like a senior agency executive briefing a prospect — not a chatbot answering questions. Always tie back to MVP Marketing's expertise. 2-3 sentences max before the CHIPS block.`;

    // 3. Build the payload with Google Search Grounding enabled
    const geminiPayload = {
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: geminiContents,
      tools: [{ googleSearch: {} }],
    };

    // 4. Fetch from Gemini 2.5 Flash
    // TYPO FIXED: Make sure your environment variable matches this spelling exactly
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

    // 5. Extract text and mock Anthropic's response structure so the frontend doesn't break
    const geminiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that.";

    const mockAnthropicResponse = {
      stop_reason: 'end_turn',
      content: [
        { type: 'text', text: geminiText }
      ]
    };

    return res.status(200).json(mockAnthropicResponse);

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
