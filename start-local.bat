@echo off
setlocal
cd /d "%~dp0"
if not exist .venv\Scripts\python.exe (
 echo Run setup-local.bat first.
 pause
 exit /b 1
)
if not exist .env.local copy .env.example .env.local >nul
start "LifeForge speech - wait for Ready" /D "%~dp0" cmd /k ".venv\Scripts\python.exe speech\server.py"
echo Keep Ollama running. Wait for speech server Ready before recording.
call npm run dev
pause
