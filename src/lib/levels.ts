const levelTitles: { [level: number]: string } = {
    1: "Novice Coder",
    2: "Apprenti du Code",
    3: "Compagnon des Bits",
    4: "Acolyte Algorithmique",
    5: "Initié de la Syntaxe",
    6: "Scribe de Scripts",
    7: "Artisan Binaire",
    8: "Technicien des Textes",
    9: "Maçon du Markup",
    10: "Vétéran du Versioning",
    20: "Maestro du Middleware",
    30: "Architecte d'API",
    40: "Virtuose de la Virtualisation",
    50: "Champion des Composants",
    60: "Seigneur des Services",
    70: "Maître du Déploiement",
    80: "Oracle de l'ORM",
    90: "Légende du Legacy",
    100: "Transcendeur de la Technologie",
};

export function getTitleForLevel(level: number): string {
    const sortedLevels = Object.keys(levelTitles).map(Number).sort((a, b) => b - a);
    for (const threshold of sortedLevels) {
        if (level >= threshold) {
            return levelTitles[threshold];
        }
    }
    return levelTitles[1]; // Default fallback
}
