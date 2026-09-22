# What If Math?

An interactive math exploration site with MathMate, an OpenAI-powered math tutor.

## Run locally

1. Install Node.js 18 or newer.
2. Set an API key in your terminal without putting it in frontend files:

   ```powershell
   $env:OPENAI_API_KEY="your-key-here"
   ```

3. Start the site:

   ```powershell
   npm start
   ```

4. Open `http://localhost:3000`.

MathMate sends questions through `server.js`, which keeps the OpenAI key on the server and
instructs the model to answer only math-related questions.

## Deployment note

GitHub Pages can host the static frontend, but it cannot run `server.js` or safely store an
OpenAI API key. To make MathMate fully live, deploy this project to a Node-compatible host such
as Vercel, Render, or Railway and add `OPENAI_API_KEY` as a server-side environment variable.
