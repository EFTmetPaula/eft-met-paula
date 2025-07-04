#!/usr/bin/env python3
"""
Script om alle kloppunt pagina's bij te werken met de nieuwe Coqui TTS implementatie
"""

import os
import re

def update_file(filepath):
    """Update een kloppunt HTML bestand met de nieuwe TTS implementatie"""
    print(f"Updaten van {filepath}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Zoek naar de volgende pagina URL
    next_page_match = re.search(r'window\.location\.href\s*=\s*[\'"]([^\'"]+)[\'"]', content)
    next_page = next_page_match.group(1) if next_page_match else 'index.html'
    
    # Nieuwe TTS implementatie code
    new_tts_code = f'''        // --- NIEUWE MANIER: COQUI TTS SERVER ---
        let audioPlayer = null;
        let repeatCount = 0;
        const maxRepeats = 3;
        let isPlaying = false;
        let nextPage = '{next_page}';

        async function speakAffirmation() {{
            try {{
                // Toon loading state
                const pausePlayButton = document.getElementById('pausePlayButton');
                pausePlayButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                
                // Roep TTS server aan
                const response = await fetch('http://localhost:5002/api/tts', {{
                    method: 'POST',
                    headers: {{
                        'Content-Type': 'application/json',
                    }},
                    body: JSON.stringify({{
                        text: affirmationText,
                        speed: 0.9  // Iets langzamer voor betere verstaanbaarheid
                    }})
                }});

                if (!response.ok) {{
                    throw new Error(`HTTP error! status: ${{response.status}}`);
                }}

                // Converteer response naar audio blob
                const audioBlob = await response.blob();
                const audioUrl = URL.createObjectURL(audioBlob);
                
                // Maak audio element
                if (audioPlayer) {{
                    audioPlayer.pause();
                    URL.revokeObjectURL(audioPlayer.src);
                }}
                
                audioPlayer = new Audio(audioUrl);
                audioPlayer.volume = 0.8;
                
                // Event listeners voor audio
                audioPlayer.onended = function() {{
                    repeatCount++;
                    if (repeatCount < maxRepeats) {{
                        setTimeout(() => {{
                            speakAffirmation();
                        }}, 1000); // 1 seconde pauze
                    }} else {{
                        // Ga automatisch naar de volgende pagina
                        window.location.href = nextPage;
                    }}
                }};
                
                audioPlayer.onerror = function() {{
                    console.error('Audio playback error');
                    pausePlayButton.innerHTML = '<i class="fas fa-play"></i>';
                    isPlaying = false;
                }};
                
                // Start afspelen
                await audioPlayer.play();
                isPlaying = true;
                pausePlayButton.innerHTML = '<i class="fas fa-pause"></i>';
                
            }} catch (error) {{
                console.error('TTS Error:', error);
                // Fallback naar browser stem als TTS server niet beschikbaar is
                fallbackToBrowserSpeech();
            }}
        }}

        // Fallback naar browser stem
        function fallbackToBrowserSpeech() {{
            console.log('Gebruik browser stem als fallback');
            const speech = new SpeechSynthesisUtterance();
            speech.lang = 'nl-NL';
            speech.rate = 0.85;
            speech.pitch = 1.2;
            speech.volume = 0.9;
            
            const voices = window.speechSynthesis.getVoices();
            let chosenVoice = voices.find(v => v.name === 'Microsoft Hanna Online' && v.lang === 'nl-NL');
            if (!chosenVoice) chosenVoice = voices.find(v => v.name.includes('Wavenet') && v.lang === 'nl-NL');
            if (!chosenVoice) chosenVoice = voices.find(v => v.name.includes('Google') && v.lang === 'nl-NL');
            if (!chosenVoice) chosenVoice = voices.find(v => v.lang === 'nl-NL');
            speech.voice = chosenVoice || voices[0];
            
            speech.text = affirmationText;
            window.speechSynthesis.cancel();
            speech.onend = function() {{
                repeatCount++;
                if (repeatCount < maxRepeats) {{
                    setTimeout(() => {{
                        fallbackToBrowserSpeech();
                    }}, 1000);
                }} else {{
                    window.location.href = nextPage;
                }}
            }};
            window.speechSynthesis.speak(speech);
        }}

        // Start automatisch zodra de pagina is geladen
        window.addEventListener('load', () => {{
            repeatCount = 0;
            setTimeout(() => {{
                speakAffirmation();
            }}, 500);
        }});

        // Pauze/play knop
        const pausePlayButton = document.getElementById('pausePlayButton');
        pausePlayButton.addEventListener('click', () => {{
            if (audioPlayer) {{
                if (isPlaying) {{
                    audioPlayer.pause();
                    pausePlayButton.innerHTML = '<i class="fas fa-play"></i>';
                    isPlaying = false;
                }} else {{
                    audioPlayer.play();
                    pausePlayButton.innerHTML = '<i class="fas fa-pause"></i>';
                    isPlaying = true;
                }}
            }}
        }});

        // Cleanup bij verlaten pagina
        window.addEventListener('beforeunload', () => {{
            if (audioPlayer) {{
                audioPlayer.pause();
                URL.revokeObjectURL(audioPlayer.src);
            }}
            window.speechSynthesis.cancel();
        }});'''
    
    # Zoek naar verschillende patronen van oude TTS code
    patterns = [
        # Patroon 1: Oude browser stem implementatie
        r'(\s+// --- OUDE MANIER: BROWSER STEM ---.*?window\.addEventListener\(''beforeunload'', \(\) => \{.*?window\.speechSynthesis\.cancel\(\);\s+\}\);)',
        # Patroon 2: SetupVoice functie met SpeechSynthesisUtterance
        r'(\s+function setupVoice\(\) \{.*?speech\.voice = chosenVoice \|\| voices\[0\];\s+\}.*?window\.addEventListener\(''beforeunload'', \(\) => \{.*?window\.speechSynthesis\.cancel\(\);\s+\}\);)',
        # Patroon 3: Eenvoudige SpeechSynthesisUtterance implementatie
        r'(\s+function speakAffirmation\(\) \{.*?window\.speechSynthesis\.speak\(utterance\);\s+\}.*?window\.addEventListener\(''beforeunload'', \(\) => \{.*?window\.speechSynthesis\.cancel\(\);\s+\}\);)'
    ]
    
    updated = False
    for pattern in patterns:
        if re.search(pattern, content, re.DOTALL):
            new_content = re.sub(pattern, new_tts_code, content, flags=re.DOTALL)
            
            # Schrijf het bestand terug
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            print(f"✓ {filepath} bijgewerkt")
            updated = True
            break
    
    if not updated:
        print(f"⚠ {filepath} heeft geen oude TTS code om te vervangen")

def main():
    """Hoofdfunctie om alle kloppunt bestanden bij te werken"""
    kloppunten_dir = 'kloppunten'
    
    if not os.path.exists(kloppunten_dir):
        print(f"Directory {kloppunten_dir} niet gevonden!")
        return
    
    # Zoek alle HTML bestanden in de kloppunten directory
    html_files = [f for f in os.listdir(kloppunten_dir) if f.endswith('.html')]
    
    print(f"Gevonden {len(html_files)} kloppunt bestanden om bij te werken:")
    for file in html_files:
        print(f"  - {file}")
    
    print("\nStart updaten...")
    
    for file in html_files:
        filepath = os.path.join(kloppunten_dir, file)
        try:
            update_file(filepath)
        except Exception as e:
            print(f"✗ Fout bij updaten van {file}: {e}")
    
    print("\nKlaar! Alle kloppunt bestanden zijn bijgewerkt met de nieuwe TTS implementatie.")

if __name__ == '__main__':
    main() 