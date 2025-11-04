// Slimme EFT Zins Formatter - zorgt voor correcte en vloeiende Nederlandse zinnen

// Functie om emotie om te zetten naar natuurlijke vorm
function formatEmotion(emotion) {
    if (!emotion) return { emotion: 'deze emotie', useVerb: false };
    
    const emotionLower = emotion.toLowerCase().trim();
    
    // Werkwoord-emoties (als werkwoord gebruiken)
    const verbEmotions = {
        'balen': 'baal',
        'piekeren': 'pieker',
        'zorgen maken': 'maak me zorgen',
        'zorgen': 'maak me zorgen',
        'twijfelen': 'twijfel',
        'huilen': 'huil',
        'lachen': 'lach',
        'denken': 'denk',
        'stressen': 'stress',
        'panikeren': 'paniek'
    };
    
    if (verbEmotions[emotionLower]) {
        return {
            emotion: verbEmotions[emotionLower],
            useVerb: true
        };
    }
    
    // Bijvoeglijke naamwoorden die direct gebruikt kunnen worden
    const adjectiveEmotions = ['moe', 'bang', 'boos', 'verdrietig', 'blij', 'gelukkig', 
                                'onzeker', 'gespannen', 'gestrest', 'rusteloos', 'angstig',
                                'teleurgesteld', 'gefrustreerd', 'geïrriteerd', 'overstuur',
                                'eenzaam', 'verward', 'somber', 'down', 'nerveus', 'zenuwachtig'];
    
    if (adjectiveEmotions.includes(emotionLower)) {
        return {
            emotion: emotionLower,
            useVerb: false
        };
    }
    
    // Zelfstandige naamwoorden omzetten naar bijvoeglijk naamwoord
    const nounToAdjective = {
        'frustratie': 'gefrustreerd',
        'angst': 'angstig',
        'boosheid': 'boos',
        'spanning': 'gespannen',
        'spanningen': 'gespannen',
        'stress': 'gestrest',
        'onzekerheid': 'onzeker',
        'teleurstelling': 'teleurgesteld',
        'verdriet': 'verdrietig',
        'irritatie': 'geïrriteerd',
        'eenzaamheid': 'eenzaam',
        'vermoeidheid': 'moe',
        'woede': 'woedend',
        'paniek': 'paniekerig',
        'schaamte': 'beschaamd',
        'schuld': 'schuldig',
        'spijt': 'vol spijt',
        'jaloezie': 'jaloers',
        'wanhoop': 'wanhopig'
    };
    
    if (nounToAdjective[emotionLower]) {
        return {
            emotion: nounToAdjective[emotionLower],
            useVerb: false
        };
    }
    
    // Automatische conversie voor eindletters
    let formattedEmotion = emotionLower;
    
    // Woorden eindigend op -ie → ge...d
    if (emotionLower.endsWith('ie') && emotionLower.length > 3) {
        formattedEmotion = 'ge' + emotionLower.slice(0, -2) + 'd';
    }
    // Woorden eindigend op -ing → ge...d
    else if (emotionLower.endsWith('ing') && emotionLower.length > 4) {
        formattedEmotion = 'ge' + emotionLower.slice(0, -3) + 'd';
    }
    // Woorden eindigend op -heid → bassvorm
    else if (emotionLower.endsWith('heid') && emotionLower.length > 5) {
        formattedEmotion = emotionLower.slice(0, -4);
    }
    
    return {
        emotion: formattedEmotion,
        useVerb: false
    };
}

// Functie om situatie te formatteren naar vloeiend Nederlands
function formatSituation(situation) {
    if (!situation) return 'deze situatie';
    
    let formatted = situation.trim();
    
    // Verwijder dubbele spaties
    formatted = formatted.replace(/\s+/g, ' ');
    
    // Begin altijd met kleine letter
    formatted = formatted.charAt(0).toLowerCase() + formatted.slice(1);
    
    // Verwijder 'omdat' aan het begin als die er staat
    if (formatted.startsWith('omdat ')) {
        formatted = formatted.substring(6).trim();
    }
    
    // Verwijder punten en komma's aan het einde
    formatted = formatted.replace(/[.,!?]+$/, '');
    
    // Grammaticale correcties - eenvoudig woord-voor-woord
    const simpleCorrections = {
        // 'Er' toevoegen waar nodig
        'iets mis is gegaan': 'er iets mis is gegaan',
        'iets mis gaat': 'er iets mis gaat',
        'iets niet klopt': 'er iets niet klopt',
        'iets gebeurd is': 'er iets is gebeurd',
        'veel te doen is': 'er veel te doen is',
        
        // Werkwoordsvormen corrigeren
        'gestreste': 'gestresde',
        'gespannene': 'gespannen',
        
        // Woordvolgorde
        'weer er': 'er weer',
        'niet er': 'er niet',
        'altijd er': 'er altijd'
    };
    
    for (const [wrong, correct] of Object.entries(simpleCorrections)) {
        const regex = new RegExp(wrong, 'gi');
        formatted = formatted.replace(regex, correct);
    }
    
    // Speciale gevallen voor volledige zinnen met werkwoord
    const situationPatterns = [
        { pattern: /^(een\s+)?(drukke\s+|zware\s+|moeilijke\s+|stressvolle\s+)?werkdag$/i, transform: (match) => `ik een drukke werkdag heb` },
        { pattern: /^(een\s+)?(moeilijke|zware|stressvolle)\s+dag$/i, transform: (match) => `ik een ${match.replace(/^een\s+/i, '')} heb` },
        { pattern: /^werkdag$/i, transform: () => `ik een drukke werkdag heb` },
        { pattern: /^(ruzie|conflict)(\s+met\s+.+)?$/i, transform: (match) => `ik ${match} heb` },
        { pattern: /^(hoofdpijn|pijn|klachten)$/i, transform: (match) => `ik ${match} heb` }
    ];
    
    for (const {pattern, transform} of situationPatterns) {
        if (pattern.test(formatted)) {
            formatted = transform(formatted);
            break;
        }
    }
    
    // Als de zin niet met een persoonlijk voornaamwoord begint, voeg context toe
    const startsWithPronoun = /^(ik|je|hij|zij|we|ze|mijn|jouw|zijn|haar|ons|hun)/i.test(formatted);
    
    if (!startsWithPronoun) {
        // Controleer of er al een werkwoord vooraan staat
        const startsWithVerb = /^(ben|heb|had|was|moet|kan|wil|ga|kom|voel|denk|zie)/i.test(formatted);
        
        if (startsWithVerb) {
            formatted = 'ik ' + formatted;
        } else {
            // Als het begint met een lidwoord, voeg "ik" en werkwoord toe
            if (/^(een|de|het)\s+/i.test(formatted)) {
                // Probeer een passend werkwoord te vinden
                if (formatted.includes('dag') || formatted.includes('moment') || formatted.includes('tijd')) {
                    formatted = 'ik ' + formatted + ' heb';
                } else {
                    formatted = 'het gaat om ' + formatted;
                }
            }
        }
    }
    
    // NIET automatisch 'omdat' toevoegen - dat gebeurt in de affirmatie zelf
    // Alleen zorgen dat de situatie een vloeiende zin is
    
    return formatted;
}

// Functie om volledige affirmatie te maken
function createAffirmation(emotion, situation, type = 'setup') {
    const formattedEmotion = formatEmotion(emotion);
    const formattedSituation = formatSituation(situation);
    
    let affirmationText = '';
    
    switch(type) {
        case 'setup': // Karatepunt - volledige setup affirmatie
            if (formattedEmotion.useVerb) {
                affirmationText = `Ook al ${formattedEmotion.emotion} omdat ${formattedSituation}, toch accepteer ik mezelf precies zoals ik ben.`;
            } else {
                affirmationText = `Ook al voel ik me ${formattedEmotion.emotion} omdat ${formattedSituation}, toch accepteer ik mezelf precies zoals ik ben.`;
            }
            break;
            
        case 'emotion': // Focus op emotie (kruin, zijkant oog, onder neus, sleutelbeen)
            if (formattedEmotion.useVerb) {
                affirmationText = `Ik ${formattedEmotion.emotion}`;
            } else {
                affirmationText = `Ik voel me ${formattedEmotion.emotion}`;
            }
            break;
            
        case 'situation': // Focus op situatie (wenkbrauw, onder oog, kin, onder arm)
            // Zorg dat de situatie als complete zin werkt
            let situationText = formattedSituation;
            
            // Als het begint met 'omdat', herschrijf naar volledige zin
            if (situationText.startsWith('omdat ')) {
                situationText = situationText.substring(6);
                affirmationText = `Dit gaat over ${situationText}`;
            } else if (situationText.startsWith('ik ')) {
                affirmationText = situationText.charAt(0).toUpperCase() + situationText.slice(1);
            } else if (situationText.startsWith('er ')) {
                affirmationText = situationText.charAt(0).toUpperCase() + situationText.slice(1);
            } else {
                affirmationText = `Dit gaat over ${situationText}`;
            }
            break;
    }
    
    return affirmationText;
}

