# Coqui TTS Integratie voor EFT App

## 🎯 Wat is Coqui TTS?

Coqui TTS is een open-source text-to-speech toolkit die zeer natuurlijke en hoogwaardige stemmen kan genereren. Het ondersteunt Nederlandse stemmen en kan lokaal draaien zonder internetverbinding.

## 🚀 Snelle Start (Windows)

### Optie 1: Automatische installatie
1. Dubbelklik op `install-coqui.bat`
2. Wacht tot de installatie voltooid is
3. Start de server met `start-server.bat`

### Optie 2: Handmatige installatie
Volg de stappen in `coqui-setup.md`

## 📁 Bestandsstructuur

```
eft-met-paula/
├── coqui-integration.js      # JavaScript integratie
├── install-coqui.bat         # Windows installatie script
├── coqui-setup.md           # Handmatige setup instructies
├── COQUI-README.md          # Deze README
└── kloppunten/
    └── kloppunt-karatepunt.html  # Voorbeeld integratie
```

## 🔧 Hoe het werkt

### 1. Coqui TTS Server
- Draait op `http://localhost:5002`
- Gebruikt Nederlandse stemmen
- Genereert hoogwaardige audio

### 2. JavaScript Integratie
- `TTSManager` klasse beheert spraak
- Automatische fallback naar Web Speech API
- Tekstoptimalisatie voor betere uitspraak

### 3. Fallback Systeem
- Als Coqui niet beschikbaar is → Web Speech API
- Als beide falen → stille modus
- Geen onderbreking van de EFT sessie

## 🎵 Beschikbare Nederlandse Stemmen

1. **mai/tacotron2-DDC** (standaard)
   - Goede kwaliteit
   - Snel
   - Klein model

2. **vctk/vits**
   - Zeer hoge kwaliteit
   - Langzamer
   - Groot model

3. **facebook/fastspeech2**
   - Snel
   - Gemiddelde kwaliteit
   - Compact

## 🔄 Integratie in bestaande bestanden

### Stap 1: Voeg script toe
```html
<script src="coqui-integration.js"></script>
```

### Stap 2: Vervang spraak code
```javascript
// Oud
let speech = new SpeechSynthesisUtterance();
speech.text = "Tekst";
window.speechSynthesis.speak(speech);

// Nieuw
let ttsManager = new TTSManager();
await ttsManager.speak("Tekst");
```

### Stap 3: Update controle functies
```javascript
// Pauzeer
ttsManager.pause();

// Hervat
ttsManager.resume();

// Stop
ttsManager.stop();
```

## 🛠️ Server Beheer

### Server starten
```bash
cd coqui-tts-server
venv\Scripts\activate.bat  # Windows
python tts_server.py
```

### Server stoppen
- Druk `Ctrl+C` in de terminal

### Server status controleren
```bash
curl http://localhost:5002/health
```

## 🎛️ Configuratie

### Server URL wijzigen
```javascript
let ttsManager = new TTSManager('http://localhost:5002');
```

### Ander model gebruiken
Bewerk `tts_server.py`:
```python
tts = TTS(model_name="tts_models/nl/vctk/vits", progress_bar=False)
```

### Tekstoptimalisatie aanpassen
Bewerk `coqui-integration.js` in de `improveTextForTTS` functie.

## 🔍 Troubleshooting

### Probleem: "Coqui TTS server niet bereikbaar"
**Oplossing:**
1. Controleer of server draait: `http://localhost:5002/health`
2. Start server opnieuw: `start-server.bat`
3. Controleer firewall instellingen

### Probleem: "Model niet gevonden"
**Oplossing:**
```bash
cd coqui-tts-server
venv\Scripts\activate.bat
python -c "from TTS.api import TTS; TTS(model_name='tts_models/nl/mai/tacotron2-DDC')"
```

### Probleem: "Geheugen fout"
**Oplossing:**
1. Sluit andere programma's
2. Gebruik kleiner model
3. Verhoog swap geheugen

### Probleem: "CORS fout"
**Oplossing:**
1. Controleer of `flask-cors` is geïnstalleerd
2. Herstart de server
3. Controleer browser console voor details

## 📊 Prestaties

### Geheugengebruik
- **mai/tacotron2-DDC**: ~500MB RAM
- **vctk/vits**: ~2GB RAM
- **fastspeech2**: ~300MB RAM

### Snelheid
- **mai/tacotron2-DDC**: ~1-2 seconden per zin
- **vctk/vits**: ~3-5 seconden per zin
- **fastspeech2**: ~0.5-1 seconde per zin

### Kwaliteit
- **mai/tacotron2-DDC**: ⭐⭐⭐⭐
- **vctk/vits**: ⭐⭐⭐⭐⭐
- **fastspeech2**: ⭐⭐⭐

## 🔄 Updates

### Coqui TTS updaten
```bash
cd coqui-tts-server
venv\Scripts\activate.bat
pip install --upgrade TTS
```

### JavaScript integratie updaten
- Vervang `coqui-integration.js` met nieuwe versie
- Test de integratie

## 📝 Logs

### Server logs
Bekijk de terminal waar de server draait voor:
- Model laad status
- API requests
- Fouten

### Browser logs
Open Developer Tools (F12) voor:
- TTS Manager status
- Fallback berichten
- Audio fouten

## 🎯 Voordelen van Coqui TTS

1. **Consistente kwaliteit** - Zelfde stem op alle apparaten
2. **Geen internet nodig** - Werkt offline
3. **Hoogwaardige audio** - Natuurlijke uitspraak
4. **Nederlandse ondersteuning** - Goede uitspraak van Nederlandse woorden
5. **Aanpasbaar** - Verschillende modellen en instellingen
6. **Open source** - Geen kosten of beperkingen

## 🆚 Vergelijking met Web Speech API

| Feature | Coqui TTS | Web Speech API |
|---------|-----------|----------------|
| Kwaliteit | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Consistentie | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Snelheid | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Offline | ✅ | ❌ |
| Nederlandse stemmen | ✅ | ⚠️ |
| Setup complexiteit | ⭐⭐⭐ | ⭐ |

## 🎉 Volgende stappen

1. **Test de integratie** - Start de server en test de app
2. **Pas andere bestanden aan** - Integreer in alle EFT pagina's
3. **Experimenteer met modellen** - Test verschillende stemmen
4. **Optimaliseer tekst** - Verbeter uitspraak van specifieke woorden
5. **Deploy naar productie** - Zet server op een vaste locatie

## 📞 Ondersteuning

Voor vragen of problemen:
- Controleer de logs
- Bekijk de troubleshooting sectie
- Test met verschillende modellen
- Neem contact op via de feedback link in de app 