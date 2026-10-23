// EFT met Paula - gedeeld voorlezen voor alle kloppunten.
// - Voorlezen start pas na een tik op "Start" (nodig voor iPhone/iPad).
// - Zoekt een Nederlandse stem; lukt dat niet, dan een vriendelijke melding en
//   kan de gebruiker zelf lezen en op "volgende" tikken.
// - Pauze stopt zowel het voorlezen als het automatisch doorgaan; verder gaat weer door.

(function (global) {
    'use strict';

    const VOICE_TIMEOUT_MS = 2000;   // zo lang wachten we maximaal op de lijst met stemmen
    const REPEAT_PAUSE_MS = 1000;    // pauze tussen herhalingen
    const MIN_PAGE_TIME_MS = 5000;   // minimaal zo lang op een kloppunt blijven
    const RESUME_ADVANCE_MS = 2000;  // na "verder" bij een afgeronde zin: even wachten

    const NO_VOICE_MESSAGE = 'Op dit apparaat is geen Nederlandse voorleesstem beschikbaar. ' +
        'Lees de zin rustig hardop terwijl je klopt, en tik daarna op ⏩ om naar het volgende punt te gaan.';
    const ERROR_MESSAGE = 'Het voorlezen lukt nu niet. Lees de zin rustig hardop terwijl je klopt, ' +
        'en tik daarna op ⏩ om naar het volgende punt te gaan.';

    function addStyles() {
        if (document.getElementById('eft-speech-styles')) return;
        const style = document.createElement('style');
        style.id = 'eft-speech-styles';
        style.textContent =
            '.eft-start-button{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;max-width:300px;' +
            'margin:20px auto 10px;padding:15px;background-color:var(--primary-color,#4d6a66);color:#fff;border:2px solid #fff;' +
            'border-radius:8px;font-size:1.1em;font-weight:600;cursor:pointer;transition:transform .3s ease,box-shadow .3s ease}' +
            '.eft-start-button:hover{transform:translateY(-3px);box-shadow:0 6px 12px rgba(77,106,102,.15)}' +
            '.eft-start-button:focus-visible{outline:3px solid #fff;outline-offset:3px}' +
            '.eft-speech-message{color:#fff;text-align:center;margin:10px auto;max-width:500px;line-height:1.5}' +
            '@media (prefers-reduced-motion:reduce){.eft-start-button{transition:none}}';
        document.head.appendChild(style);
    }

    // Kies de meest natuurlijke Nederlandse stem die dit toestel heeft. Echte namen per platform:
    // ALLEEN stemmen die op het toestel zelf werken (localService), zodat de zin het toestel nooit verlaat.
    // Online stemmen (bv. "Microsoft ... Online (Natural)" in Edge, "Google Nederlands" in Chrome) slaan we over.
    // - Windows lokaal: "Microsoft Frank - Dutch (Netherlands)"; Android: de Nederlandse systeemstem
    // - iOS/macOS: "Claire" (nl-NL), "Xander" (nl-NL, man), "Ellen" (nl-BE); verbeterde varianten heten
    //   "Claire (Enhanced)"/"(Premium)" of hebben voiceURI "com.apple.voice.enhanced|premium...."
    // Volgorde: nl-NL boven nl-BE, natuurlijke/neurale/verbeterde stemmen eerst, vrouwenstem boven mannenstem.
    const isNL = v => /^nl[-_]NL$/i.test(v.lang);
    const isDutch = v => /^nl([-_]|$)/i.test(v.lang);
    const QUALITY = /Natural|Neural|Online|Enhanced|Premium|Siri|Wavenet|enhanced\.|premium\./i;
    const FEMALE = ['Colette', 'Fenna', 'Claire', 'Ellen', 'Dena', 'Hanna', 'Google Nederlands', 'Wavenet-A', 'Wavenet-C'];
    const MALE = /Frank|Xander|Maarten|Arnaud/i;

    function voiceScore(v) {
        const id = (v.name || '') + ' ' + (v.voiceURI || '');
        let score = 0;
        if (isNL(v)) score += 100;
        if (QUALITY.test(id)) score += 50;
        const f = FEMALE.findIndex(n => id.includes(n));
        if (f >= 0) score += 30 - f;        // eerder in de lijst = voorkeur
        if (MALE.test(id)) score -= 20;
        return score;
    }

    function pickVoice(voices) {
        const dutch = (voices || []).filter(v => isDutch(v) && v.localService !== false);
        if (!dutch.length) return null;
        return dutch.reduce((best, v) => (voiceScore(v) > voiceScore(best) ? v : best));
    }

    // Wacht maximaal VOICE_TIMEOUT_MS op de stemmenlijst (geen eindeloze lus)
    function loadVoice() {
        return new Promise(resolve => {
            const synth = global.speechSynthesis;
            if (!synth || typeof global.SpeechSynthesisUtterance === 'undefined') return resolve(null);
            let done = false;
            const finish = () => {
                if (done) return;
                const voices = synth.getVoices() || [];
                const voice = pickVoice(voices);
                if (voice) { done = true; resolve(voice); }
            };
            finish();
            if (done) return;
            if (synth.addEventListener) synth.addEventListener('voiceschanged', finish);
            setTimeout(() => {
                if (done) return;
                done = true;
                resolve(pickVoice(synth.getVoices() || []));
            }, VOICE_TIMEOUT_MS);
        });
    }

    function init(options) {
        const text = options.text;
        const nextUrl = options.next;
        const repeats = Math.max(1, options.repeats || 1);
        const synth = global.speechSynthesis;

        addStyles();
        if (synth) synth.cancel(); // eventuele spraak van de vorige pagina stoppen

        const pauseButton = document.getElementById('pausePlayButton');
        const iconRow = pauseButton ? pauseButton.parentElement : null;

        // Startknop en meldingsruimte toevoegen boven de knoppenrij
        const startButton = document.createElement('button');
        startButton.type = 'button';
        startButton.className = 'eft-start-button';
        startButton.id = 'startSpeechButton';
        startButton.innerHTML = '<i class="fas fa-play" aria-hidden="true"></i>';
        startButton.setAttribute('aria-label', 'Start voorlezen');
        const message = document.createElement('p');
        message.className = 'eft-speech-message';
        message.id = 'speechMessage';
        message.setAttribute('role', 'status');
        message.hidden = true;
        if (iconRow) {
            iconRow.parentElement.insertBefore(startButton, iconRow);
            iconRow.parentElement.insertBefore(message, iconRow);
        }

        // Status: 'idle' | 'playing' | 'paused' | 'finished' | 'manual'
        let state = 'idle';
        let voice = null;
        let repeatIndex = 0;
        let speechDone = false;
        let generation = 0;           // om callbacks van geannuleerde spraak te negeren
        let advanceTimer = null;
        let repeatTimer = null;
        let startTime = 0;

        function setIcon(name, label) {
            if (!pauseButton) return;
            pauseButton.innerHTML = '<i class="fas fa-' + name + '" aria-hidden="true"></i>';
            pauseButton.setAttribute('aria-label', label);
            pauseButton.title = label;
        }

        function showMessage(text) {
            message.textContent = text;
            message.hidden = false;
        }

        function clearTimers() {
            clearTimeout(advanceTimer);
            clearTimeout(repeatTimer);
            advanceTimer = repeatTimer = null;
        }

        function goManual(text) {
            clearTimers();
            state = 'manual';
            startButton.hidden = true;
            setIcon('play', 'Voorlezen niet beschikbaar');
            showMessage(text);
        }

        function scheduleAdvance(delay) {
            clearTimeout(advanceTimer);
            advanceTimer = setTimeout(() => {
                if (state === 'finished') global.location.href = nextUrl;
            }, delay);
        }

        function speakNext() {
            const myGeneration = ++generation;
            const utterance = new global.SpeechSynthesisUtterance(text);
            utterance.lang = 'nl-NL';
            utterance.rate = 0.85;
            utterance.pitch = 1.0;
            utterance.volume = 0.9;
            try { utterance.voice = voice; } catch (e) { /* stem kan niet gezet worden: standaardstem */ }

            utterance.onend = () => {
                if (myGeneration !== generation || state !== 'playing') return;
                repeatIndex++;
                if (repeatIndex < repeats) {
                    repeatTimer = setTimeout(() => {
                        if (state === 'playing') speakNext();
                    }, REPEAT_PAUSE_MS);
                } else {
                    speechDone = true;
                    state = 'finished';
                    setIcon('pause', 'Pauze');
                    scheduleAdvance(Math.max(0, MIN_PAGE_TIME_MS - (Date.now() - startTime)));
                }
            };
            utterance.onerror = (event) => {
                if (myGeneration !== generation) return;
                if (event && (event.error === 'interrupted' || event.error === 'canceled')) return;
                goManual(ERROR_MESSAGE);
            };
            synth.speak(utterance);
        }

        function start() {
            if (!voice) { goManual(NO_VOICE_MESSAGE); return; }
            state = 'playing';
            repeatIndex = 0;
            speechDone = false;
            startTime = Date.now();
            startButton.hidden = true;
            message.hidden = true;
            setIcon('pause', 'Pauze');
            synth.cancel();
            speakNext();
        }

        function pause() {
            clearTimers();
            generation++;                 // lopende spraak negeren
            if (synth) synth.cancel();    // cancel werkt betrouwbaarder dan pause() op mobiel
            state = 'paused';
            setIcon('play', 'Verder');
        }

        function resume() {
            setIcon('pause', 'Pauze');
            if (speechDone) {
                state = 'finished';
                scheduleAdvance(RESUME_ADVANCE_MS);
            } else {
                state = 'playing';
                speakNext();              // huidige herhaling opnieuw voorlezen
            }
        }

        startButton.addEventListener('click', start);

        if (pauseButton) {
            setIcon('play', 'Start');
            pauseButton.addEventListener('click', () => {
                if (state === 'idle') start();
                else if (state === 'playing' || state === 'finished') pause();
                else if (state === 'paused') resume();
            });
        }

        global.addEventListener('beforeunload', () => {
            clearTimers();
            if (synth) synth.cancel();
        });

        // Startknop pas actief maken als we weten of er een stem is
        startButton.disabled = true;
        loadVoice().then(v => {
            voice = v;
            startButton.disabled = false;
            if (!voice) goManual(NO_VOICE_MESSAGE);
        });

        return { start, pause, resume, getState: () => state };
    }

    global.EFTSpeech = { init, pickVoice };
})(window);
