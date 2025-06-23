@echo off
echo ========================================
echo    EFT Website - Afbeeldingen Verkleinen
echo ========================================
echo.

echo Controleer of Python geïnstalleerd is...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is niet geïnstalleerd of niet gevonden in PATH
    echo Download Python van: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo ✓ Python gevonden
echo.

echo Installeer benodigde packages...
pip install Pillow

echo.
echo Start verkleinen van afbeeldingen...
python resize-images.py

echo.
echo Klaar! Druk op een toets om af te sluiten...
pause 