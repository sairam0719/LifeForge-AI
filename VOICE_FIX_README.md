# LifeForge AI — Local edition (no paid API key)

For a Windows laptop with 16GB RAM and Ryzen 7. CPU defaults do not require an NVIDIA GPU. The UI is retained. This is a local application, not a hosted free API. Electricity, storage and model downloads still use your resources.

## First setup
1. Install Node.js 22.12+ or 24 from https://nodejs.org/
2. Install Python 3.11 (64 bit) from https://www.python.org/downloads/ . Include the Python launcher and Add Python to PATH.
3. Install Ollama for Windows from https://ollama.com/download/windows and open it.
4. Extract this ZIP into a NEW folder named LifeForge_AI_Local. Do not reuse an earlier Gemini/OpenAI folder or its .env.local.
5. Double-click setup-local.bat. It runs npm install, creates a private Python environment, installs local speech dependencies and downloads qwen2.5:3b. Keep Ollama running. If a command fails, the script stops and shows the error.
6. Double-click start-local.bat. It opens the speech server in another terminal and starts the app in the current terminal. First speech launch downloads the multilingual Whisper small model. Wait until it says Ready. Keep both terminals and Ollama open.
7. Open http://localhost:3000 in a full browser tab. Allow microphone permission.
8. Click the assistant microphone, speak Telugu, English or mixed speech, then click Done Speaking. Recordings automatically stop at 55 seconds.

No OPENAI_API_KEY, GEMINI_API_KEY, billing account, or API credit is required. Models are not bundled in the ZIP. Internet is needed for installation/model downloads, then core local inference can run without internet (external UI fonts may still request internet).

## Commands if double-click setup fails
Open cmd in the extracted folder:

```bat
npm install
py -3.11 -m venv .venv
.venv\Scripts\python.exe -m pip install -r speech\requirements.txt
ollama pull qwen2.5:3b
copy .env.example .env.local
```

Only copy .env.example if .env.local does not already exist. Start speech in one terminal:

```bat
.venv\Scripts\python.exe speech\server.py
```

Start app in another:

```bat
npm run dev
```

## What the assistant does
- Typed messages -> local Ollama model -> structured LifeForge actions -> the existing application state.
- Voice -> local multilingual Whisper CPU int8 -> the SAME chat/action flow -> browser speech output.
- Scope: water, study duration/progress, sleep, exercise, tasks, meals, social media, commitments, schedules and habits. The prompt redirects general lessons/exam answers and unrelated requests. Model scope adherence is not perfect.
- Reported ordinary logging can update immediately. Goal changes, tasks, meals and other non-log changes require review/confirmation in the chat panel. Values and ambiguous task names are validated. Confirm in the chat panel after closing the voice modal.
- Short conversation history is passed to local chat for follow-up context.
- Records remain in browser localStorage, not a synchronized cloud database.

## Verify water
Use a 3L daily goal. Say or type “I drank 1.5 liters of water”: 1.5L consumed, 1.5L remaining. Then “I drank another 500 ml”: 2L consumed, 1L remaining. Check Water and Dashboard, then refresh. Ordinary amounts preserve the prior app behavior of setting today's total; another/add means increment. Unambiguous present-day numeric English water commands have a deterministic fast path; other languages/phrasing use the model.

## Performance/languages
This is not guaranteed to be instant or as accurate as ChatGPT. First model load is slower. CPU transcription and chat can take several seconds or longer. Telugu/code-mixed recognition and replies need your own test; small models can make mistakes. Read the displayed transcript and use text to correct misunderstandings. Whisper defaults to multilingual small (not small.en); change WHISPER_MODEL to base for faster but generally less accurate speech, then restart speech. qwen2.5:3b is the default chat model; to try a larger model install it with ollama pull and change OLLAMA_MODEL in .env.local.

Spoken replies use installed browser/OS voices. English audio is commonly available. The modal shows a clear notice and preserves Telugu text if a Telugu voice is unavailable. This does not include bundled offline Telugu text-to-speech.

## Optional food-photo vision
Text model cannot inspect photos. To enable the local vision feature:

```bat
ollama pull qwen2.5vl:3b
```

Uncomment OLLAMA_VISION_MODEL=qwen2.5vl:3b in .env.local and restart the app. This requires another download and more RAM/time; on a 16GB laptop close unnecessary apps. Photo analysis remains an estimate requiring confirmation. Vision unloads after each request. Without this optional model, food photos show setup instructions instead of invented results.

## Errors
“Ollama is not running”: open Ollama and run ollama list; check qwen2.5:3b is installed.
“Local speech server is not running”: run start-local.bat and wait for Ready; inspect the speech terminal.
Microphone denied: allow site microphone permission and Windows microphone privacy access. Embedded previews may block it; use a full tab.
Port already in use: stop the earlier LifeForge server with Ctrl+C before starting this version.
Model download fails: check internet and model download access; rerun setup.
No GPU: expected; CPU int8 mode is configured.

The app and speech server listen on loopback for local use. Hosting remotely requires a separate deployment architecture; users' browsers cannot reach services on your laptop automatically.

## Validation
TypeScript check, production build and Python syntax checks passed. Automated tests cover deterministic water math, exclusions for questions/history, invalid values, ambiguous tasks, confirmation, local-only endpoints, mocked model/speech responses, and unavailable services. Live Express water and service-error checks passed. Actual Ollama/Whisper inference, microphone input, Windows installers and laptop latency were not tested here.

Run checks with npm run lint, npm run build and npm run test:local.

References: https://ollama.com/library/qwen2.5/tags ; https://github.com/SYSTRAN/faster-whisper ; https://ollama.com/library/qwen2.5vl
