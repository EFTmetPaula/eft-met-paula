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
        'alleen', 'ongerust', 'opgefokt', 'gepest', 'onveilig',
        // korte, veelgebruikte woorden die je niet aan de uitgang herkent
        'stom', 'dom', 'rot', 'klote', 'kut', 'slecht', 'raar', 'gek', 'vies', 'ziek', 'zwak',
        'klein', 'groot', 'lelijk', 'dik', 'nutteloos', 'waardeloos', 'schuldig', 'gestresst',
        'chagrijnig', 'nijdig', 'prikkelbaar', 'overprikkeld', 'onbegrepen', 'genegeerd',
        'verlaten', 'gebruikt', 'tekortgedaan', 'buitengesloten', 'onrechtvaardig', 'boze',
        'misselijk', 'duizelig', 'ongemakkelijk', 'ellendig', 'verloren', 'vast', 'gevangen',
        'onmachtig', 'hopeloos', 'futloos', 'lusteloos', 'suf', 'moedeloos', 'radeloos',
        'goed', 'fijn', 'oké', 'oke', 'ok', 'beroerd', 'belabberd', 'zielig', 'schuldbewust',
        'gefrustreert', 'gestressed', 'bedroefd', 'gedeprimeerd', 'depressief', 'verdoofd',
        'opgelaten', 'beschaamd', 'gespannen', 'onzeker', 'nerveus', 'kwetsbaar', 'gevoelig'
    ];

    // Gevoelens die je "hebt": "Ik heb pijn", "Ook al heb ik heimwee ..."
    const HAVE_NOUNS = [
        'pijn', 'hoofdpijn', 'buikpijn', 'rugpijn', 'heimwee', 'spijt', 'last', 'haast',
        'honger', 'dorst', 'zorgen', 'het moeilijk', 'het zwaar', 'het koud', 'het warm',
        'het druk', 'een rotgevoel', 'een naar gevoel'
    ];

    // Gevoelens die je als zelfstandig naamwoord "voelt": "Ik voel onrust", "Ik voel druk"
    const FEEL_NOUNS = ['druk', 'rouw', 'onmacht', 'weerstand', 'leegte', 'liefde', 'verlangen', 'walging', 'afkeer', 'haat'];

    function looksLikeAdjective(word) {
        if (KNOWN_ADJECTIVES.includes(word)) return true;
        if (/(ig|lijk|loos|baar|isch|zaam|ief|eus|end|ers)$/.test(word)) return true;
        if (/^(ge|be|ver|over|op|uit|on|af|mis)\S+[dt]$/.test(word)) return true; // gekwetst, overweldigd
        return false;
    }

    // Typisch zelfstandig naamwoord: angst, onzekerheid, spanning, schaamte, paniek, ...
    function looksLikeNoun(word) {
        return /(heid|ing|ingen|nis|schap|dom|te|st|ie|iek|ij|sel|teit)$/.test(word);
    }

    // Geeft { type: 'verb' | 'adjective' | 'noun' | 'have', ... } terug
    function parseEmotion(input) {
        let text = clean(input).toLowerCase();
        // "ik voel me bang", "ik ben bang", "me bang", "ik heb pijn", "voel me stom" -> kern
        text = text.replace(/^(ik\s+)?(voel\s+)?(me|mij|mezelf|mijzelf)\s+/, '')
                   .replace(/^(ik\s+)?(ben|voel|heb)\s+(me\s+|mij\s+|mezelf\s+)?/, '')
                   .replace(/^ik\s+/, '')
                   .replace(/\s+(me|mij)$/, '')          // "stom voel me" e.d.
                   .trim();

        if (!text) return { type: 'noun', word: 'deze emotie' };
        if (VERB_EMOTIONS[text]) return Object.assign({ type: 'verb' }, VERB_EMOTIONS[text]);
        if (NOUN_TO_ADJECTIVE[text]) return { type: 'adjective', word: NOUN_TO_ADJECTIVE[text] };
        if (HAVE_NOUNS.includes(text)) return { type: 'have', word: text };
        if (FEEL_NOUNS.includes(text)) return { type: 'noun', word: text };

        const words = text.split(' ');
        const lastWord = words[words.length - 1];
        // Begint met een lidwoord of hoeveelheid: "een knoop in mijn maag", "veel stress"
        if (/^(een|de|het|veel|wat|geen|zoveel)$/.test(words[0]) && words.length > 1) {
            return { type: 'noun', word: text };
        }
        if (looksLikeAdjective(lastWord)) return { type: 'adjective', word: text };
        if (looksLikeNoun(lastWord)) return { type: 'noun', word: text };

        // Onbekend woord: meestal een bijvoeglijk naamwoord ("Ik voel me stom").
        return { type: 'adjective', word: text };
    }

    // "Ik voel me bang" / "Ik baal" / "Ik maak me zorgen" / "Ik voel onrust"
    function emotionPhrase(input) {
        const e = parseEmotion(input);
        if (e.type === 'verb') return ('Ik ' + e.finite + ' ' + e.rest).trim();
        if (e.type === 'have') return 'Ik heb ' + e.word;
        if (e.type === 'adjective') return 'Ik voel me ' + e.word;
        return 'Ik voel ' + e.word;
    }

    // Deel voor de opstartzin, met inversie: "voel ik me bang" / "baal ik" / "maak ik me zorgen"
    function emotionInverted(input) {
        const e = parseEmotion(input);
        if (e.type === 'verb') return (e.finite + ' ik ' + e.rest).trim();
        if (e.type === 'have') return 'heb ik ' + e.word;
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

    const POSSESSABLE = /^(werk|baan|baas|collega|collega's|team|studie|school|opleiding|examen|tentamen|toets|presentatie|sollicitatie|gesprek|afspraak|relatie|partner|vriend|vriendin|man|vrouw|ex|moeder|vader|ouders|zus|broer|kind|kinderen|zoon|dochter|familie|schoonmoeder|schoonfamilie|buren|buurman|buurvrouw|gezondheid|lichaam|gewicht|rug|hoofd|financiën|schulden|huis|verhuizing|vakantie|verjaardag|planning|agenda|telefoon|hond|kat)\b/i;

    // Geeft { kind: 'clause' | 'noun', text } terug
    function parseSituation(input) {
        let text = clean(input);
        // Alleen het eerste woord naar kleine letter als het een gewoon woord is
        // (zo blijven namen als "Jan" intact).
        if (LOWERCASE_FIRST.test(text)) text = text.charAt(0).toLowerCase() + text.slice(1);
        text = text.replace(/^(omdat|want|doordat|vanwege|door|dat|het feit dat)\s+/i, '').trim();
        if (LOWERCASE_FIRST.test(text)) text = text.charAt(0).toLowerCase() + text.slice(1);

        if (!text) return { kind: 'noun', text: 'deze situatie' };
        // Eén los woord als "alles" of "niets": "door alles"
        if (/^(alles|iets|niets|iedereen|niemand)$/i.test(text)) return { kind: 'noun', text: text };
        // Kaal zelfstandig naamwoord zonder lidwoord ("werk", "presentatie morgen"): "mijn" ervoor
        if (POSSESSABLE.test(text)) text = 'mijn ' + text;

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

    // Na "omdat" hoort het werkwoord achteraan: "mijn werk is te druk" -> "mijn werk te druk is",
    // "ik kan niet slapen" -> "ik niet kan slapen". Alleen bij eenvoudige zinnen met één werkwoord.
    const MODALS = /^(moet|kan|kon|wil|wilde|ga|zal|mag|durf)$/i;
    const SUBCLAUSE_WORDS = /\b(dat|omdat|als|die|wie|wat|want|en|maar|of|terwijl|toen|zodat|waardoor|doordat)\b/i;
    function verbToEnd(text) {
        const words = text.split(' ');
        if (words.length < 3 || SUBCLAUSE_WORDS.test(text)) return text;
        const isVerb = w => FINITE_VERBS.has(w.toLowerCase()) || VERB_START.test(w) && w.length === w.match(VERB_START)[0].length;
        const idx = [];
        const hasModal = words.some(w => MODALS.test(w));
        words.forEach((w, i) => {
            if (hasModal && i === words.length - 1 && /(en|aan)$/i.test(w)) return;   // infinitief na moet/kan
            if (i > 0 && isVerb(w)) idx.push(i);
        });
        if (idx.length !== 1) return text;
        const i = idx[0];
        if (i >= words.length - 1 || i > 3) return text;   // staat al achteraan, of onderwerp te lang
        const verb = words.splice(i, 1)[0];
        const last = words[words.length - 1];
        if (MODALS.test(verb) && /(en|aan)$/i.test(last) && words.length - 1 > i - 1) {
            words.splice(words.length - 1, 0, verb);        // "... kan slapen"
        } else {
            words.push(verb);
        }
        return words.join(' ');
    }

    // Deel na de emotie in de opstartzin: "omdat ik ..." of "door de deadline"
    function situationConnector(input) {
        const s = parseSituation(input);
        return s.kind === 'clause' ? 'omdat ' + verbToEnd(s.text) : 'door ' + s.text;
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
