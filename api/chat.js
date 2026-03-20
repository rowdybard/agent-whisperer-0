export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { systemPrompt, userMessage, model = 'gpt-4o-mini', maxTokens = 512 } = req.body;

  if (!userMessage || typeof userMessage !== 'string') {
    return res.status(400).json({ error: 'userMessage is required' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server misconfiguration: missing API key' });
  }

  try {
    const messages = [];

    if (systemPrompt && typeof systemPrompt === 'string' && systemPrompt.trim()) {
      messages.push({ role: 'system', content: systemPrompt.trim() });
    }

    messages.push({ role: 'user', content: userMessage.trim() });

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: Math.min(Number(maxTokens) || 512, 2048),
        temperature: 0.7,
      }),
    });

    if (!openaiRes.ok) {
      const errBody = await openaiRes.json().catch(() => ({}));
      const message = errBody?.error?.message || 'OpenAI request failed';
      return res.status(openaiRes.status).json({ error: message });
    }

    const data = await openaiRes.json();
    const reply = data.choices?.[0]?.message?.content ?? '';

    return res.status(200).json({
      reply,
      usage: data.usage,
    });
  } catch (err) {
    console.error('[api/chat] Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
