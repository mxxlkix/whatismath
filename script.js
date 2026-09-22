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

  if (value <= 3) {
    scenarioText.textContent = 'A compact universe with a few dimensions behaves in a way that feels familiar, almost like a simple map.';
  } else if (value <= 7) {
    scenarioText.textContent = `A world with ${value} dimensions invites the possibility of hidden geometry, hidden paths, and hidden meaning.`;
  } else {
    scenarioText.textContent = `At ${value} dimensions, the universe stretches toward complexity, where each new layer creates a new possibility for surprise.`;
  }

  const orbit = document.querySelector('.hero-visual');
  if (orbit) {
    orbit.style.transform = `scale(${1 + growth / 100})`;
  }
}

slider.addEventListener('input', updateDimensions);
updateDimensions();

revealButton.addEventListener('click', () => {
  answerText.classList.toggle('visible');
  revealButton.textContent = answerText.classList.contains('visible') ? 'Hide answer' : 'Reveal answer';
});

function addChatMessage(text, type) {
  const message = document.createElement('div');
  message.className = `chat-message ${type}-message`;
  message.innerHTML = type === 'bot'
    ? `<span class="chat-avatar">∑</span><p>${text}</p>`
    : `<p>${text}</p>`;
  chatWindow.appendChild(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

mathForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const question = mathQuestion.value.trim();
  if (!question) return;
  addChatMessage(question.replace(/</g, '&lt;').replace(/>/g, '&gt;'), 'user');
  mathQuestion.value = '';
  addChatMessage('Thinking through the problem…', 'bot');
  const thinkingMessage = chatWindow.lastElementChild;

  try {
    const response = await fetch('/api/math', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'The math service is unavailable.');
    thinkingMessage.querySelector('p').innerHTML = data.answer;
  } catch (error) {
    thinkingMessage.querySelector('p').textContent = error.message;
  } finally {
    mathQuestion.focus();
  }
});
