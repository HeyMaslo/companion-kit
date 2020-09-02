
export function checkTriggerPhrase(input: string): string {
    const phrases = TriggerPhrases;
    if (!input || !phrases.length) {
        return null;
    }

    for (let i = 0; i < phrases.length; ++i) {
        const p = phrases[i];
        const re = new RegExp(p, 'mi');
        const res = re.exec(input);
        if (res?.length && res[0]) {
            return res[0];
        }
    }
}

export const TriggerPhrases = [
    // Danger to Self
    'want to die',
    'kill myself',
    'game end',
    'life sucks',
    /happy when I'?\s*a?m gone/,
    'not worth living',
    /I'?\s*a?m worthless/,
    'I want a truck to hit me',
    /end (\w+('s)? ?)+ life/,
    /wish (\w+('s)? ?)+ were dead/,
    /sorry when I'?\s*a?m gone/,
    'hara-kiri',
    'kamikaze',
    'autocide',
    'self destruction',
    'nobody gets me',
    'everything sucks',
    "what's the point of living",
    'catch the bus',
    'fade to black',
    'eat a gun',
    'kerosine dream',
    'carosine dream',
    'shotgun mouthwash',
    'permanent vacation',

    // Danger to Other
    'to kill',
    'going to pay',
    /kick (\w+('s)? ?) ass/,
    'beat up',
    'going to waste',
    /blow (\w+('s)? ?) away/,
    'gun',
    /wish (\w+('s)? ?) dead/,
    'pop a cap',
    'throw down',
    'shoot',
    'murder',
    'annihilate',
    'to off',
    /going to (dust|off|smoke|ice)/,
    'tango down',
    'OJ',
    '187',
    'gank',

    // Substance and High Risk Behavior
    'get wasted',
    'blitzed',
    'drunk ',
    'passed out',
    'tweeked',
    'tweeking',
    /get (\w+('s)? ?) high/,
    'faded',
    'rolling',
    'cracked out',
    'get loaded',
    'smoke out ',
    '420',
    'molly',
];
