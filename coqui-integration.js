// Coqui TTS Integration voor EFT App
class CoquiTTS {
    constructor(serverUrl = 'http://localhost:5002') {
        this.serverUrl = serverUrl;
        this.isAvailable = false;
        this.checkServer();
    }

    // Controleer of de Coqui server beschikbaar is
    async checkServer() {
        try {
            const response = await fetch(`${this.serverUrl}/health`);
            if (response.ok) {
                this.isAvailable = true;
                console.log('✅ Coqui TTS server is beschikbaar');
            } else {
                console.warn('⚠️ Coqui TTS server niet beschikbaar, fallback naar Web Speech API');
            }
        } catch (error) {
            console.warn('⚠️ Coqui TTS server niet bereikbaar, fallback naar Web Speech API');
        }
    }

    // Spreek tekst uit met Coqui TTS
    async speak(text) {
        if (!this.isAvailable) {
            throw new Error('Coqui TTS server niet beschikbaar');
        }

        try {
            const response = await fetch(`${this.serverUrl}/api/tts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: text })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            
            return new Promise((resolve, reject) => {
                const audio = new Audio(audioUrl);
                
                audio.onended = () => {
                    URL.revokeObjectURL(audioUrl);
                    resolve();
                };
                
                audio.onerror = (error) => {
                    URL.revokeObjectURL(audioUrl);
                    reject(error);
                };
                
                audio.play().catch(reject);
            });
        } catch (error) {
            console.error('Coqui TTS fout:', error);
            throw error;
        }
    }

    // Verbeter tekst voor betere TTS uitspraak
    improveTextForTTS(text) {
        let improvedText = text;
        
        // Voeg pauzes toe voor betere uitspraak
        improvedText = improvedText.replace(/,/g, ', ');
        improvedText = improvedText.replace(/\./g, '. ');
        
        // Verbeter uitspraak van specifieke Nederlandse woorden
        improvedText = improvedText.replace(/gestresst/g, 'ge-stresst');
        improvedText = improvedText.replace(/teleurgesteld/g, 'teleur-ge-steld');
        improvedText = improvedText.replace(/onzeker/g, 'on-ze-ker');
        improvedText = improvedText.replace(/vermoeid/g, 'ver-moeid');
        improvedText = improvedText.replace(/eenzaam/g, 'een-zaam');
        improvedText = improvedText.replace(/frustrated/g, 'frus-trated');
        improvedText = improvedText.replace(/overwhelmed/g, 'over-whelmed');
        
        // Verbeter uitspraak van belangrijke woorden
        improvedText = improvedText.replace(/accepteer/g, 'ac-cep-teer');
        improvedText = improvedText.replace(/precies/g, 'pre-cies');
        improvedText = improvedText.replace(/mezelf/g, 'me-zelf');
        
        return improvedText;
    }
}

// Fallback naar Web Speech API
class FallbackTTS {
    constructor() {
        this.speech = null;
        this.setupVoice();
    }

    setupVoice() {
        this.speech = new SpeechSynthesisUtterance();
        this.speech.lang = 'nl-NL';
        this.speech.rate = 0.8;
        this.speech.pitch = 1.0;
        this.speech.volume = 1.0;

        const voices = window.speechSynthesis.getVoices();
        let chosenVoice = voices.find(v => v.lang === 'nl-NL');
        if (!chosenVoice && voices.length > 0) {
            chosenVoice = voices[0];
        }
        this.speech.voice = chosenVoice;
    }

    speak(text) {
        return new Promise((resolve, reject) => {
            if (window.speechSynthesis && this.speech) {
                window.speechSynthesis.cancel();
                this.speech.text = text;
                this.speech.onend = resolve;
                this.speech.onerror = reject;
                window.speechSynthesis.speak(this.speech);
            } else {
                reject(new Error('Web Speech API niet beschikbaar'));
            }
        });
    }
}

// Hoofdklasse voor TTS beheer
class TTSManager {
    constructor() {
        this.coquiTTS = new CoquiTTS();
        this.fallbackTTS = new FallbackTTS();
        this.useCoqui = true;
    }

    async speak(text) {
        const improvedText = this.coquiTTS.improveTextForTTS(text);
        
        if (this.useCoqui && this.coquiTTS.isAvailable) {
            try {
                console.log('🎤 Gebruik Coqui TTS');
                await this.coquiTTS.speak(improvedText);
            } catch (error) {
                console.warn('⚠️ Coqui TTS gefaald, fallback naar Web Speech API');
                this.useCoqui = false;
                await this.fallbackTTS.speak(improvedText);
            }
        } else {
            console.log('🎤 Gebruik Web Speech API');
            await this.fallbackTTS.speak(improvedText);
        }
    }

    // Pauzeer spraak
    pause() {
        if (this.useCoqui && this.coquiTTS.isAvailable) {
            // Coqui TTS heeft geen pauze functionaliteit, dus we kunnen alleen stoppen
            console.log('⏸️ Pauze niet beschikbaar voor Coqui TTS');
        } else {
            window.speechSynthesis.pause();
        }
    }

    // Hervat spraak
    resume() {
        if (this.useCoqui && this.coquiTTS.isAvailable) {
            console.log('▶️ Hervat niet beschikbaar voor Coqui TTS');
        } else {
            window.speechSynthesis.resume();
        }
    }

    // Stop spraak
    stop() {
        if (this.useCoqui && this.coquiTTS.isAvailable) {
            // Coqui TTS heeft geen stop functionaliteit
            console.log('⏹️ Stop niet beschikbaar voor Coqui TTS');
        } else {
            window.speechSynthesis.cancel();
        }
    }
}

// Export voor gebruik in andere bestanden
window.TTSManager = TTSManager; 