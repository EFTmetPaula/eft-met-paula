from flask import Flask, request, send_file
from flask_cors import CORS
import io
import os
from TTS.api import TTS

app = Flask(__name__)
CORS(app)

print("Laden van TTS model...")
# Probeer eerst betere Nederlandse modellen, anders gebruik een algemeen model
try:
    # Probeer eerst een moderner Nederlands model
    tts = TTS(model_name="tts_models/nl/mai/fastpitch", progress_bar=False)
    print("Nederlands FastPitch model geladen!")
except:
    try:
        # Fallback naar het originele Nederlandse model
        tts = TTS(model_name="tts_models/nl/mai/tacotron2-DDC", progress_bar=False)
        print("Nederlands Tacotron2 model geladen!")
    except:
        try:
            # Probeer een modern Engels model als fallback
            tts = TTS(model_name="tts_models/en/ljspeech/fastpitch", progress_bar=False)
            print("Engels FastPitch model geladen (fallback)")
        except:
            try:
                # Fallback naar het originele Engelse model
                tts = TTS(model_name="tts_models/en/ljspeech/tacotron2-DDC", progress_bar=False)
                print("Engels Tacotron2 model geladen (fallback)")
            except:
                # Laatste fallback naar standaard model
                tts = TTS(progress_bar=False)
                print("Standaard TTS model geladen")

@app.route('/api/tts', methods=['POST'])
def generate_speech():
    try:
        data = request.json
        text = data.get('text', '')
        speed = data.get('speed', 1.0)  # Spraaksnelheid (0.5 = langzaam, 2.0 = snel)
        
        if not text:
            return {'error': 'Geen tekst opgegeven'}, 400
        
        # Genereer spraak met aangepaste parameters
        wav = tts.tts(
            text=text,
            speaker=None,  # Gebruik standaard spreker
            language=None,  # Auto-detect taal
            speed=speed
        )
        
        # Converteer naar audio bytes
        audio_bytes = io.BytesIO()
        import soundfile as sf
        sf.write(audio_bytes, wav, tts.synthesizer.output_sample_rate, format='WAV')
        audio_bytes.seek(0)
        
        return send_file(audio_bytes, mimetype='audio/wav', as_attachment=True, download_name='speech.wav')
    except Exception as e:
        print(f"Fout: {str(e)}")
        return {'error': str(e)}, 500

@app.route('/health', methods=['GET'])
def health_check():
    return {'status': 'healthy', 'model': str(tts.model_name)}

if __name__ == '__main__':
    print("Start TTS server op http://localhost:5002")
    app.run(host='0.0.0.0', port=5002, debug=False) 