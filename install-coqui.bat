@echo off
echo ========================================
echo Coqui TTS Installatie voor EFT App
echo ========================================
echo.

echo Stap 1: Controleer Python installatie...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is niet geïnstalleerd!
    echo Download en installeer Python van: https://python.org
    pause
    exit /b 1
)
echo ✅ Python is geïnstalleerd

echo.
echo Stap 2: Maak project directory...
if not exist "coqui-tts-server" mkdir coqui-tts-server
cd coqui-tts-server

echo.
echo Stap 3: Maak virtual environment...
python -m venv venv
if errorlevel 1 (
    echo ❌ Fout bij maken virtual environment
    pause
    exit /b 1
)
echo ✅ Virtual environment gemaakt

echo.
echo Stap 4: Activeer virtual environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ❌ Fout bij activeren virtual environment
    pause
    exit /b 1
)
echo ✅ Virtual environment geactiveerd

echo.
echo Stap 5: Upgrade pip...
python -m pip install --upgrade pip

echo.
echo Stap 6: Installeer Coqui TTS...
echo Dit kan enkele minuten duren...
pip install TTS
if errorlevel 1 (
    echo ❌ Fout bij installeren Coqui TTS
    pause
    exit /b 1
)
echo ✅ Coqui TTS geïnstalleerd

echo.
echo Stap 7: Installeer Flask dependencies...
pip install flask flask-cors soundfile
if errorlevel 1 (
    echo ❌ Fout bij installeren Flask dependencies
    pause
    exit /b 1
)
echo ✅ Flask dependencies geïnstalleerd

echo.
echo Stap 8: Maak server script...
echo from flask import Flask, request, send_file > tts_server.py
echo from flask_cors import CORS >> tts_server.py
echo import io >> tts_server.py
echo import os >> tts_server.py
echo from TTS.api import TTS >> tts_server.py
echo. >> tts_server.py
echo app = Flask(__name__) >> tts_server.py
echo CORS(app) >> tts_server.py
echo. >> tts_server.py
echo print("Laden van TTS model...") >> tts_server.py
echo tts = TTS(model_name="tts_models/nl/mai/tacotron2-DDC", progress_bar=False) >> tts_server.py
echo print("TTS model geladen!") >> tts_server.py
echo. >> tts_server.py
echo @app.route('/api/tts', methods=['POST']) >> tts_server.py
echo def generate_speech(): >> tts_server.py
echo     try: >> tts_server.py
echo         data = request.json >> tts_server.py
echo         text = data.get('text', '') >> tts_server.py
echo         if not text: >> tts_server.py
echo             return {'error': 'Geen tekst opgegeven'}, 400 >> tts_server.py
echo         wav = tts.tts(text=text) >> tts_server.py
echo         audio_bytes = io.BytesIO() >> tts_server.py
echo         import soundfile as sf >> tts_server.py
echo         sf.write(audio_bytes, wav, tts.synthesizer.output_sample_rate, format='WAV') >> tts_server.py
echo         audio_bytes.seek(0) >> tts_server.py
echo         return send_file(audio_bytes, mimetype='audio/wav', as_attachment=True, download_name='speech.wav') >> tts_server.py
echo     except Exception as e: >> tts_server.py
echo         print(f"Fout: {str(e)}") >> tts_server.py
echo         return {'error': str(e)}, 500 >> tts_server.py
echo. >> tts_server.py
echo @app.route('/health', methods=['GET']) >> tts_server.py
echo def health_check(): >> tts_server.py
echo     return {'status': 'healthy'} >> tts_server.py
echo. >> tts_server.py
echo if __name__ == '__main__': >> tts_server.py
echo     print("Start TTS server op http://localhost:5002") >> tts_server.py
echo     app.run(host='0.0.0.0', port=5002, debug=False) >> tts_server.py

echo ✅ Server script gemaakt

echo.
echo Stap 9: Download TTS model...
echo Dit kan enkele minuten duren...
python -c "from TTS.api import TTS; TTS(model_name='tts_models/nl/mai/tacotron2-DDC')"
if errorlevel 1 (
    echo ⚠️ Model download gefaald, maar server kan nog steeds werken
)

echo.
echo ========================================
echo ✅ Installatie voltooid!
echo ========================================
echo.
echo Om de Coqui TTS server te starten:
echo 1. Ga naar de coqui-tts-server directory
echo 2. Activeer de virtual environment: venv\Scripts\activate.bat
echo 3. Start de server: python tts_server.py
echo.
echo Of gebruik het start-server.bat script dat ik nu maak...

echo.
echo Maak start script...
echo @echo off > start-server.bat
echo cd /d "%~dp0" >> start-server.bat
echo call venv\Scripts\activate.bat >> start-server.bat
echo python tts_server.py >> start-server.bat
echo pause >> start-server.bat

echo ✅ Start script gemaakt

echo.
echo Wil je de server nu starten? (j/n)
set /p choice=
if /i "%choice%"=="j" (
    echo.
    echo Start TTS server...
    python tts_server.py
) else (
    echo.
    echo Je kunt de server later starten met: start-server.bat
)

echo.
echo Installatie voltooid! Druk op een toets om af te sluiten...
pause 