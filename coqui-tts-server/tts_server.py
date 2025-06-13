from flask import Flask, request, send_file
from flask_cors import CORS
import io
import os
from TTS.api import TTS

app = Flask(__name__)
CORS(app)

print("Laden van TTS model...")
# Probeer eerst het Nederlandse model, anders gebruik een algemeen model
try:
    tts = TTS(model_name="tts_models/nl/mai/tacotron2-DDC", progress_bar=False)
    print("Nederlands TTS model geladen!")
except:
    try:
        tts = TTS(model_name="tts_models/en/ljspeech/tacotron2-DDC", progress_bar=False)
        print("Engels TTS model geladen (fallback)")
    except:
        tts = TTS(progress_bar=False)
        print("Standaard TTS model geladen")

@app.route('/api/tts', methods=['POST'])
def generate_speech():
    try:
        data = request.json
        text = data.get('text', '')
        if not text:
            return {'error': 'Geen tekst opgegeven'}, 400
        
        # Genereer spraak
        wav = tts.tts(text=text)
        
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