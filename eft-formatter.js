// EFT met Paula - gedeelde zinnenmaker voor alle kloppunten.
// Uitgangspunt: gebruik zoveel mogelijk de eigen woorden van de gebruiker
// en voeg alleen toe wat nodig is voor een correcte Nederlandse zin.

(function (global) {
    'use strict';

    // ---------- Hulpfuncties ----------
    function clean(text) {
        return String(text || '')
            .replace(/\s+/g, ' ')
            .trim()
            .replace(/^["'“”‘’]+|["'“”‘’]+$/g, '')
            .replace(/[.,!?;:]+$/, '')
            .trim();
    }

    function capitalize(text) {
        return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
    }

    // ---------- Emotie ----------
    // Emoties die als werkwoord werken: finite = vervoegd werkwoord, rest = wat erna komt.
    // "Ik {finite} {rest}"  en  "Ook al {finite} ik {rest} omdat ..."
    const VERB_EMOTIONS = {
        'balen': { finite: 'baal', rest: '' },
        'baal': { finite: 'baal', rest: '' },
        'piekeren': { finite: 'pieker', rest: '' },
        'pieker': { finite: 'pieker', rest: '' },
        'twijfelen': { finite: 'twijfel', rest: '' },
        'twijfel': { finite: 'twijfel', rest: '' },
        'huilen': { finite: 'huil', rest: '' },
        'stressen': { finite: 'stress', rest: '' },
        'zorgen': { finite: 'maak', rest: 'me zorgen' },
        'zorgen maken': { finite: 'maak', rest: 'me zorgen' },
        'me zorgen maken': { finite: 'maak', rest: 'me zorgen' },
        'zorgen makend': { finite: 'maak', rest: 'me zorgen' },
        'schamen': { finite: 'schaam', rest: 'me' },
        'ergeren': { finite: 'erger', rest: 'me' }
    };

    // Zelfstandige naamwoorden die we omzetten naar een bijvoeglijk naamwoord
    // ("Ik voel me ...").
    const NOUN_TO_ADJECTIVE = {
        'angst': 'angstig',
        'boosheid': 'boos',
        'woede': 'woedend',
        'frustratie': 'gefrustreerd',
        'irritatie': 'geïrriteerd',
        'spanning': 'gespannen',
        'spanningen': 'gespannen',
        'stress': 'gestrest',
        'onzekerheid': 'onzeker',
        'teleurstelling': 'teleurgesteld',
        'verdriet': 'verdrietig',
        'eenzaamheid': 'eenzaam',
        'vermoeidheid': 'moe',
        'paniek': 'paniekerig',
        'panikeren': 'paniekerig',
        'schaamte': 'beschaamd',
        'schuld': 'schuldig',
        'jaloezie': 'jaloers',
        'wanhoop': 'wanhopig',
        'nervositeit': 'nerveus',
        'onrust': 'onrustig',
        'machteloosheid': 'machteloos',
        'somberheid': 'somber',
        'verwarring': 'verward',
        'gestresst': 'gestrest',
        'gestressed': 'gestrest'
    };

    const KNOWN_ADJECTIVES = [
        'moe', 'bang', 'boos', 'kwaad', 'blij', 'down', 'op', 'leeg', 'triest', 'naar',
        'verdrietig', 'onzeker', 'gespannen', 'gestrest', 'rusteloos', 'angstig',
        'teleurgesteld', 'gefrustreerd', 'geïrriteerd', 'overstuur', 'eenzaam', 'verward',
        'somber', 'nerveus', 'zenuwachtig', 'jaloers', 'schuldig', 'beschaamd', 'woedend',
        'wanhopig', 'machteloos', 'onrustig', 'overweldigd', 'gekwetst', 'opgejaagd',
        'uitgeput', 'paniekerig', 'bezorgd', 'kapot', 'verlegen', 'gekrenkt', 'afgewezen',
        'alleen', 'ongerust', 'opgefokt', 'gepest', 'gekwetst', 'onveilig'
    ];

    function looksLikeAdjective(word) {
        if (KNOWN_ADJECTIVES.includes(word)) return true;
        if (/(ig|lijk|loos|baar|isch|zaam|ief|eus|end)$/.test(word)) return true;
        if (/^(ge|be|ver|over|op|uit)\S+[dt]$/.test(word)) return true; // gekwetst, overweldigd
        return false;
    }

    // Geeft { type: 'verb' | 'adjective' | 'noun', ... } terug
    function parseEmotion(input) {
        let text = clean(input).toLowerCase();
        // "ik voel me bang", "ik ben bang", "me bang" -> "bang"
        text = text.replace(/^(ik\s+)?(voel\s+)?(me|mij)\s+/, '')
                   .replace(/^ik\s+(ben|voel)\s+(me\s+|mij\s+)?/, '')
                   .trim();

        if (!text) return { type: 'noun', word: 'deze emotie' };
        if (VERB_EMOTIONS[text]) return Object.assign({ type: 'verb' }, VERB_EMOTIONS[text]);
        if (NOUN_TO_ADJECTIVE[text]) return { type: 'adjective', word: NOUN_TO_ADJECTIVE[text] };

        const lastWord = text.split(' ').pop();
        if (looksLikeAdjective(lastWord)) return { type: 'adjective', word: text };

        // Onbekend woord: gebruik het letterlijk als zelfstandig naamwoord ("Ik voel onrust").
        return { type: 'noun', word: text };
    }

    // "Ik voel me bang" / "Ik baal" / "Ik maak me zorgen" / "Ik voel onrust"
    function emotionPhrase(input) {
        const e = parseEmotion(input);
        if (e.type === 'verb') return ('Ik ' + e.finite + ' ' + e.rest).trim();
        if (e.type === 'adjective') return 'Ik voel me ' + e.word;
        return 'Ik voel ' + e.word;
    }

    // Deel voor de opstartzin, met inversie: "voel ik me bang" / "baal ik" / "maak ik me zorgen"
    function emotionInverted(input) {
        const e = parseEmotion(input);
        if (e.type === 'verb') return (e.finite + ' ik ' + e.rest).trim();
        if (e.type === 'adjective') return 'voel ik me ' + e.word;
        return 'voel ik ' + e.word;
    }

    // ---------- Situatie ----------
    const PRONOUN_START = /^(ik|je|jij|hij|zij|ze|we|wij|u|men|er|iemand|niemand|iets|niets|alles|mensen|anderen)\b/i;
    const VERB_START = /^(ben|heb|had|was|moet|kan|kon|wil|ga|kom|voel|denk|zie|weet|word|werd|mis|zit|sta|loop)\b/i;
    const CLAUSE_HINTS = /\b(niet|nooit|geen|weer|altijd|steeds|alweer|nog|te|al|zo)\b/i;
    // Veelvoorkomende vervoegde werkwoorden: staat er één (niet als eerste woord) in, dan is het een bijzin.
    const FINITE_VERBS = new Set(('is ben bent was waren zijn heb hebt heeft hebben had hadden kan kun kunt kunnen kon ' +
        'wil wilt willen wilde moet moeten moest zal zullen gaat gaan ging komt komen kwam wordt worden werd lukt lukken ' +
        'weet weten doet doen deed blijft blijven klopt kloppen luistert luisteren belt bellen begrijpt snapt ziet zien ' +
        'zegt zeggen werkt werken slaapt slapen eet praat praten reageert reageren zeurt zeuren schreeuwt maakt maken ' +
        'vindt vinden krijgt krijgen verliest verlaat mist missen stopt begint beginnen duurt kost kosten gebeurt gebeurde ' +
        'verandert verhuist vertrekt ligt liggen zit zitten staat staan loopt lopen huilt huilen vecht vechten ruziën ' +
        'overleden overlijdt regent').split(' '));
    const LOWERCASE_FIRST = /^(ik|je|jij|hij|zij|ze|we|wij|mijn|jouw|zijn|haar|ons|onze|hun|de|het|een|er|iemand|niemand|iets|niets|alles|dat|dit|die|deze|omdat|vanwege|door|ben|heb|had|was|moet|kan|wil|ga)\b/i;

    // Geeft { kind: 'clause' | 'noun', text } terug
    function parseSituation(input) {
        let text = clean(input);
        // Alleen het eerste woord naar kleine letter als het een gewoon woord is
        // (zo blijven namen als "Jan" intact).
        if (LOWERCASE_FIRST.test(text)) text = text.charAt(0).toLowerCase() + text.slice(1);
        text = text.replace(/^(omdat|want|doordat|vanwege|door)\s+/i, '').trim();

        if (!text) return { kind: 'noun', text: 'deze situatie' };

        if (PRONOUN_START.test(text)) return { kind: 'clause', text: text };
        if (VERB_START.test(text)) return { kind: 'clause', text: 'ik ' + text };

        const words = text.split(' ');
        const lastWord = words[words.length - 1];
        const hasVerb = words.slice(1).some(w => FINITE_VERBS.has(w.toLowerCase()));
        if (hasVerb || (words.length >= 3 && CLAUSE_HINTS.test(text))) {
            return { kind: 'clause', text: text };
        }

        // Kort zinsdeel zonder werkwoord, bv. "zware werkdag", "ruzie met mijn zus".
        // Bij "(...)dag/week/nacht" en "ruzie/conflict/pijn" maken we er "ik ... heb" van,
        // de woorden van de gebruiker blijven gelijk.
        if (/^(ruzie|conflict|hoofdpijn|buikpijn|pijn|klachten|last|spijt|haast|stress)\b/i.test(text)) {
            return { kind: 'clause', text: 'ik ' + text + ' heb' };
        }
        if (/(dag|week|nacht|ochtend|avond)$/i.test(lastWord) && !/^(de|het|mijn|jouw|zijn|haar|onze|hun|die|deze)$/i.test(words[0])) {
            const withArticle = /^een\b/i.test(text) ? text : 'een ' + text;
            return { kind: 'clause', text: 'ik ' + withArticle + ' heb' };
        }
        return { kind: 'noun', text: text };
    }

    // Deel na de emotie in de opstartzin: "omdat ik ..." of "door de deadline"
    function situationConnector(input) {
        const s = parseSituation(input);
        return (s.kind === 'clause' ? 'omdat ' : 'door ') + s.text;
    }

    // Herinneringszin voor de situatie-kloppunten
    function situationPhrase(input) {
        return capitalize(situationConnector(input));
    }

    function setupSentence(emotion, situation) {
        return 'Ook al ' + emotionInverted(emotion) + ' ' + situationConnector(situation) +
               ', toch accepteer ik mezelf precies zoals ik ben.';
    }

    // Compatibel met de oude aanroep createAffirmation(emotie, situatie, type)
    function createAffirmation(emotion, situation, type) {
        switch (type || 'setup') {
            case 'emotion': return emotionPhrase(emotion);
            case 'situation': return situationPhrase(situation);
            default: return setupSentence(emotion, situation);
        }
    }

    const api = { parseEmotion, parseSituation, emotionPhrase, situationPhrase, setupSentence, createAffirmation };
    global.EFTFormatter = api;
    global.createAffirmation = createAffirmation;
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
