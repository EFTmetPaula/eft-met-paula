@echo off
cd /d "%~dp0"
call venv\Scripts\activate.bat
python tts_server.py
pause 