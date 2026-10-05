@echo off
setlocal
cd /d "%~dp0"
where ollama >nul 2>nul
if errorlevel 1 (
 echo Install Ollama from https://ollama.com/download/windows, then run this again.
 pause
 exit /b 1
)
if not exist .env.local copy .env.example .env.local >nul
call npm install
if errorlevel 1 goto failed
if not exist .venv\Scripts\python.exe py -3.11 -m venv .venv
if errorlevel 1 goto failed
.venv\Scripts\python.exe -m pip install -r speech\requirements.txt
if errorlevel 1 goto failed
ollama pull qwen2.5:3b
if errorlevel 1 goto failed
echo Setup complete. Run start-local.bat next. No API key needed.
pause
exit /b 0
:failed
echo Setup failed. Read the error above. Install Node.js and Python 3.11 if missing.
pause
exit /b 1
