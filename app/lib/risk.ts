interface RiskInput {
    failedAttempts: number
    suspiciousIP: boolean
}

export function calculateRisk(
    data: RiskInput
) {
    let score = 0

    score += data.failedAttempts * 20

    if (data.suspiciousIP) {
        score += 40
    }

    return Math.min(score, 100)
}