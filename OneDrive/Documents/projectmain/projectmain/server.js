/* Minimal API server to proxy AI requests for the OncoGuard demo
   Run with: `node server.js` (requires Node 18+ or node-fetch polyfill)
   Set environment variable OPENAI_API_KEY before starting.
*/
const express = require('express');
const path = require('path');
const fetch = global.fetch || require('node-fetch');
const app = express();
app.use(express.json({ limit: '1mb' }));

// Serve static files from project root
app.use(express.static(path.join(__dirname)));

// Simple /api/analyze endpoint that forwards to OpenAI Chat API
app.post('/api/analyze', async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY not set on server' });

  const { patient, lifestyle, symptoms } = req.body || {};
  const prompt = `You are a clinical assistant. Produce a concise HTML report containing: a short summary, an overall risk level (Low/Moderate/High), key risk factors, and 4-6 bullet recommendations. Respond with a JSON object: {"html": "<h3>...</h3>"} only.`;

  const userContent = `Patient: ${JSON.stringify(patient)}\nLifestyle: ${JSON.stringify(lifestyle)}\nSymptoms: ${JSON.stringify(symptoms)}`;

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful clinical summarization assistant.' },
          { role: 'user', content: prompt + '\n\n' + userContent }
        ],
        max_tokens: 800,
        temperature: 0.2,
      })
    });

    const j = await r.json();
    const text = j?.choices?.[0]?.message?.content || '';
    let html = text;
    try { const parsed = JSON.parse(text); if (parsed.html) html = parsed.html; } catch (e) { /* keep text as fallback */ }
    return res.json({ html });
  } catch (err) {
    console.error('AI proxy error', err);
    return res.status(500).json({ error: 'AI request failed' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
