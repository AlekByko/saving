export function safeRound(olderFavors: number, delta: number, magnitude: number) {
    return Math.round((olderFavors + delta) * magnitude) / magnitude;
}
