const tutorInstructions = 'You are MathMate, a rigorous and friendly mathematics tutor. Answer only mathematics, statistics, logic, mathematical modelling, or math homework. Refuse non-math requests briefly. Explain math step by step, show the final answer clearly, state assumptions, and verify when practical. Return plain text.';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  const question = typeof request.body?.question === 'string' ? request.body.question.trim() : '';
  if (!question) {
    return response.status(400).json({ error: 'Please enter a math question.' });
  }
  if (question.length > 4000) {
    return response.status(413).json({ error: 'Please keep the question under 4,000 characters.' });
  }

  const apiKey = process.env['GEMINI_API_KEY'];
  if (!apiKey) {
    return response.status(500).json({ error: 'MathMate is not configured yet. Add GEMINI_API_KEY in Vercel project settings.' });
  }

  try {
    const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=' + encodeURIComponent(apiKey);
    const result = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: tutorInstructions }] },
        contents: [{ role: 'user', parts: [{ text: question }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 900 }
      })
    });

    const data = await result.json();
    if (!result.ok) {
      throw new Error(data.error?.message || 'Gemini could not answer this question.');
    }

    const answer = (data.candidates?.[0]?.content?.parts || [])
      .map(part => part.text || '')
      .join('')
      .trim() || 'I could not find a math answer for that.';
    const safeAnswer = answer
      .replace(/[&<>]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[character]))
      .replace(/\n/g, '<br>');
    return response.status(200).json({ answer: safeAnswer });
  } catch (error) {
    return response.status(500).json({ error: error.message || 'The math service is unavailable.' });
  }
}
