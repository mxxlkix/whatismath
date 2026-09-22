export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' });
  const question = typeof request.body?.question === 'string' ? request.body.question.trim() : '';
  if (!question) return response.status(400).json({ error: 'Please enter a math question.' });
  if (!process.env.OPENAI_API_KEY) return response.status(500).json({ error: 'MathMate is not configured yet. Add OPENAI_API_KEY in Vercel project settings.' });
  try {
    const result = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4.1-mini', temperature: 0.2, max_output_tokens: 900,
        input: [
          { role: 'system', content: [{ type: 'input_text', text: 'You are MathMate, a rigorous and friendly mathematics tutor. Answer only mathematics, statistics, logic, mathematical modelling, or math homework. Refuse non-math requests briefly. Explain math step by step, show the final answer clearly, state assumptions, and verify when practical. Return plain text.' }] },
          { role: 'user', content: [{ type: 'input_text', text: question }] }
        ]
      })
    });
    const data = await result.json();
    if (!result.ok) throw new Error(data.error?.message || 'OpenAI could not answer this question.');
    const answer = (data.output_text || 'I could not find a math answer for that.').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])).replace(/\n/g, '<br>');
    return response.status(200).json({ answer });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
                                                                                                             }
