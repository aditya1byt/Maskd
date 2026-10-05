import OpenAI from 'openai';

// ── Types ──────────────────────────────────────────────────────────

export type ModerationAction = 'allow' | 'flag' | 'block';

export interface ModerationResult {
    flagged: boolean;
    action: ModerationAction;
    categories: string[];
    scores: Record<string, number>;
    moderatedAt: Date;
}

// ── Client ─────────────────────────────────────────────────────────

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// ── Policy thresholds ──────────────────────────────────────────────

/**
 * Categories that warrant immediate BLOCK when flagged by the API.
 * These represent severe, dangerous, or clearly illegal content.
 */
const SEVERE_CATEGORIES: string[] = [
    'harassment/threatening',
    'hate/threatening',
    'illicit/violent',
    'self-harm/intent',
    'self-harm/instructions',
    'sexual/minors',
    'violence',
    'violence/graphic',
];

/**
 * If any individual category score exceeds this threshold, block the message
 * even if the category isn't in the SEVERE list. This catches high-confidence
 * harmful content that falls outside the severe categories.
 */
const BLOCK_SCORE_THRESHOLD = 0.85;

// ── Service ────────────────────────────────────────────────────────

/**
 * Run a message through OpenAI's dedicated Moderation API and return a clean
 * application-level result with an allow / flag / block decision.
 *
 * Decision logic:
 *   - flagged=false  →  ALLOW
 *   - flagged=true + severe category or high score  →  BLOCK
 *   - flagged=true + moderate categories  →  FLAG (saved for admin review)
 *
 * @param content  The message text to moderate (10-300 chars, pre-validated)
 * @throws         Error if the OpenAI API call fails (timeout, auth, rate limit, etc.)
 */
export async function moderateMessage(content: string): Promise<ModerationResult> {
    const response = await openai.moderations.create({
        model: 'omni-moderation-latest',
        input: content,
    });

    const result = response.results[0];

    // Collect every category that was flagged by the API
    const flaggedCategories: string[] = [];
    const categoryScores: Record<string, number> = {};

    for (const [category, isFlagged] of Object.entries(result.categories)) {
        const score = (result.category_scores as unknown as Record<string, number>)[category] ?? 0;

        if (isFlagged) {
            flaggedCategories.push(category);
            categoryScores[category] = Math.round(score * 10000) / 10000; // 4 decimal places
        }
    }

    // ── Determine action ───────────────────────────────────────────

    let action: ModerationAction = 'allow';

    if (result.flagged) {
        // Default to FLAG for any flagged content (saved but reviewable)
        action = 'flag';

        // Escalate to BLOCK if any severe category is present
        const hasSevereCategory = flaggedCategories.some(cat =>
            SEVERE_CATEGORIES.includes(cat)
        );

        // Escalate to BLOCK if any score is extremely high
        const hasHighScore = Object.values(categoryScores).some(
            score => score > BLOCK_SCORE_THRESHOLD
        );

        if (hasSevereCategory || hasHighScore) {
            action = 'block';
        }
    }

    return {
        flagged: result.flagged,
        action,
        categories: flaggedCategories,
        scores: categoryScores,
        moderatedAt: new Date(),
    };
}
