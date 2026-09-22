const slider = document.getElementById('dimensionSlider');
const dimensionValue = document.getElementById('dimensionValue');
const equationDisplay = document.getElementById('equationDisplay');
const scenarioText = document.getElementById('scenarioText');
const revealButton = document.getElementById('revealAnswer');
const answerText = document.getElementById('challengeAnswer');
const mathForm = document.getElementById('mathForm');
const mathQuestion = document.getElementById('mathQuestion');
const chatWindow = document.getElementById('chatWindow');

function updateDimensions() {
  const value = Number(slider.value);
  const result = value ** 2 + value + 1;
  const growth = value * 1.8 + 3.5;
  dimensionValue.textContent = value;
  equationDisplay.textContent = `V = ${value}² + ${value} + 1 = ${result}`;
  if (value <= 3) scenarioText.textContent = 'A compact universe with a few dimensions behaves in a way that feels familiar, almost like a simple map.';
  else if (value <= 7) scenarioText.textContent = `A world with ${value} dimensions invites the possibility of hidden geometry, hidden paths, and hidden meaning.`;
  else scenarioText.textContent = `At ${value} dimensions, the universe stretches toward complexity, where each new layer creates a new possibility for surprise.`;
  const orbit = document.querySelector('.hero-visual');
  if (orbit) orbit.style.transform = `scale(${1 + growth / 100})`;
}

slider.addEventListener('input', updateDimensions);
updateDimensions();
revealButton.addEventListener('click', () => {
  answerText.classList.toggle('visible');
  revealButton.textContent = answerText.classList.contains('visible') ? 'Hide answer' : 'Reveal answer';
});

function escapeHtml(text) {
  return text.replace(/[&<>]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[character]));
}

function formatMathAnswer(text) {
  const lines = escapeHtml(text).split('\n');
  let html = '<div class="math-response">';
  let hasLabel = false;
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const labelMatch = trimmed.match(/^(ANSWER|METHOD|STEPS|WORKING|CHECK|FINAL ANSWER|EXPLANATION)\s*:?\s*(.*)$/i);
    if (labelMatch) {
      html += `<div class="response-section"><span class="response-label">${labelMatch[1]}</span>${labelMatch[2] ? `<div>${labelMatch[2]}</div>` : ''}</div>`;
      hasLabel = true;
    } else if (/^(\d+[.)]|[-*])\s/.test(trimmed) || /[=≠≈≤≥]/.test(trimmed)) {
      html += `<span class="math-line">${trimmed}</span>`;
    } else {
      html += `<div>${trimmed}</div>`;
    }
  });
  html += '</div>';
  return hasLabel || lines.length > 1 ? html : escapeHtml(text);
}

function addChatMessage(text, type, formatted = false) {
  const message = document.createElement('div');
  message.className = `chat-message ${type}-message`;
  const content = formatted ? formatMathAnswer(text) : escapeHtml(text);
  message.innerHTML = type === 'bot' ? `<span class="chat-avatar">∑</span><p>${content}</p>` : `<p>${content}</p>`;
  chatWindow.appendChild(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return message;
}

mathForm.addEventListener('submit', async event => {
  event.preventDefault();
  const question = mathQuestion.value.trim();
  if (!question) return;
  addChatMessage(question, 'user');
  mathQuestion.value = '';
  const thinkingMessage = addChatMessage('<span class="typing-dots"><i></i><i></i><i></i></span>', 'bot', false);
  thinkingMessage.querySelector('p').innerHTML = '<span class="typing-dots"><i></i><i></i><i></i></span><span> MathMate is working it out…</span>';
  try {
    const response = await fetch('/api/math', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'The math service is unavailable.');
    thinkingMessage.querySelector('p').innerHTML = formatMathAnswer(data.answer.replace(/<br\s*\/?>/gi, '\n'));
  } catch (error) {
    thinkingMessage.querySelector('p').textContent = error.message;
  } finally {
    mathQuestion.focus();
  }
});
