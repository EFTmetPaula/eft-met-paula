# Coqui TTS Setup voor EFT App

## Vereisten
- Python 3.8 of hoger
- Git
- Minimaal 4GB RAM
- 2GB vrije schijfruimte

## Stap 1: Python omgeving opzetten

```bash
# Maak een nieuwe directory voor het project
mkdir coqui-tts-server
cd coqui-tts-server

# Maak een virtual environment
python -m venv venv

# Activeer de virtual environment
# Op Windows:
venv\Scripts\activate
# Op macOS/Linux:
source venv/bin/activate
```

## Stap 2: Coqui TTS installeren

```bash
# Installeer Coqui TTS
pip install TTS

# Of voor de nieuwste versie:
pip install git+https://github.com/coqui-ai/TTS.git
```

## Stap 3: Nederlandse stemmen downloaden

```bash
# Download een Nederlandse stem (bijvoorbeeld VCTK)
tts --text "Test" --model_name tts_models/nl/mai/tacotron2-DDC --out_path test.wav
```

## Stap 4: Server script maken

Maak een bestand `tts_server.py`:

```python
from flask import Flask, request, send_file
from flask_cors import CORS
import io
import os
from TTS.api import TTS

app = Flask(__name__)
CORS(app)  # Sta cross-origin requests toe

# Laad het TTS model
print("Laden van TTS model...")
tts = TTS(model_name="tts_models/nl/mai/tacotron2-DDC", progress_bar=False)
print("TTS model geladen!")

@app.route('/api/tts', methods=['POST'])
def generate_speech():
    try:
        data = request.json
        text = data.get('text', '')
        
        if not text:
            return {'error': 'Geen tekst opgegeven'}, 400
        
        # Genereer audio
        wav = tts.tts(text=text)
        
        # Converteer naar bytes
        audio_bytes = io.BytesIO()
        import soundfile as sf
        sf.write(audio_bytes, wav, tts.synthesizer.output_sample_rate, format='WAV')
        audio_bytes.seek(0)
        
        return send_file(
            audio_bytes,
            mimetype='audio/wav',
            as_attachment=True,
            download_name='speech.wav'
        )
    
    except Exception as e:
        print(f"Fout: {str(e)}")
        return {'error': str(e)}, 500

@app.route('/health', methods=['GET'])
def health_check():
    return {'status': 'healthy'}

if __name__ == '__main__':
    print("Start TTS server op http://localhost:5002")
    app.run(host='0.0.0.0', port=5002, debug=False)
```

## Stap 5: Server starten

```bash
# Installeer Flask dependencies
pip install flask flask-cors soundfile

# Start de server
python tts_server.py
```

## Stap 6: Test de server

```bash
# Test met curl
curl -X POST http://localhost:5002/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"Hallo, dit is een test."}' \
  --output test.wav
```

## Beschikbare Nederlandse modellen

1. **mai/tacotron2-DDC** - Goede kwaliteit, snel
2. **vctk/vits** - Zeer hoge kwaliteit, langzamer
3. **facebook/fastspeech2** - Snel, gemiddelde kwaliteit

## Troubleshooting

### Probleem: Model niet gevonden
```bash
# Download model handmatig
tts --text "Test" --model_name tts_models/nl/mai/tacotron2-DDC --out_path test.wav
```

### Probleem: Geheugen fout
- Sluit andere programma's
- Gebruik een kleiner model
- Verhoog swap geheugen

### Probleem: CORS fout
- Zorg dat CORS is geïnstalleerd: `pip install flask-cors`
- Controleer dat de server draait op de juiste poort 