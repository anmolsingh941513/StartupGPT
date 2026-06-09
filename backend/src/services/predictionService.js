/**
 * Startup Success Prediction Service
 *
 * Uses a weighted scoring model to predict startup success probability.
 * Each factor is normalised to [0, 1] and multiplied by its weight.
 * The final score is mapped to a 0-100 probability and a risk tier.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

const INDUSTRY_SCORES = {
  Technology:       0.85,
  Healthcare:       0.80,
  Finance:          0.75,
  Education:        0.70,
  'E-commerce':     0.72,
  'Food & Beverage':0.60,
  'Real Estate':    0.65,
  Entertainment:    0.62,
  Sustainability:   0.78,
  Other:            0.55,
}

const BUSINESS_MODEL_SCORES = {
  SaaS:         0.90,
  Marketplace:  0.80,
  D2C:          0.70,
  Subscription: 0.85,
  Freemium:     0.75,
  Enterprise:   0.82,
  Advertising:  0.60,
  Consulting:   0.65,
  Hardware:     0.55,
  Other:        0.50,
}

const BUDGET_SCORES = {
  '< ₹1L':         0.20,
  '₹1L - ₹5L':    0.40,
  '₹5L - ₹20L':   0.65,
  '₹20L - ₹1Cr':  0.85,
  '> ₹1Cr':        1.00,
}

const TEAM_SIZE_SCORES = {
  Solo:  0.40,
  '2-5': 0.75,
  '6-10':0.85,
  '11-20':0.90,
  '20+': 0.95,
}

// Feature weights (must sum to 1.0)
const WEIGHTS = {
  industry:          0.10,
  businessModel:     0.12,
  budget:            0.15,
  teamSize:          0.10,
  marketSizeScore:   0.15,
  innovationScore:   0.15,
  founderExperience: 0.10,
  hasMvp:            0.07,
  hasTraction:       0.06,
  competitionLevel:  0.00, // handled as penalty below
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

export function predictSuccess(input) {
  const {
    industry,
    business_model,
    budget,
    team_size,
    market_size_score,   // 1-10
    innovation_score,    // 1-10
    founder_experience,  // years (0-20+)
    has_mvp,
    has_traction,
    competition_level,   // 1-10 (10 = very competitive)
  } = input

  // Normalise each factor
  const industryScore       = INDUSTRY_SCORES[industry]       ?? 0.55
  const businessModelScore  = BUSINESS_MODEL_SCORES[business_model] ?? 0.55
  const budgetScore         = BUDGET_SCORES[budget]           ?? 0.40
  const teamScore           = TEAM_SIZE_SCORES[team_size]     ?? 0.50
  const marketScore         = Math.min(Number(market_size_score), 10) / 10
  const innovScore          = Math.min(Number(innovation_score), 10) / 10
  const expScore            = Math.min(Number(founder_experience), 20) / 20
  const mvpScore            = has_mvp ? 1 : 0
  const tractionScore       = has_traction ? 1 : 0
  const competitionPenalty  = (Math.min(Number(competition_level), 10) / 10) * 0.10

  const rawScore =
    industryScore      * WEIGHTS.industry +
    businessModelScore * WEIGHTS.businessModel +
    budgetScore        * WEIGHTS.budget +
    teamScore          * WEIGHTS.teamSize +
    marketScore        * WEIGHTS.marketSizeScore +
    innovScore         * WEIGHTS.innovationScore +
    expScore           * WEIGHTS.founderExperience +
    mvpScore           * WEIGHTS.hasMvp +
    tractionScore      * WEIGHTS.hasTraction -
    competitionPenalty

  // Clamp to [0, 1] and convert to percentage
  const probability = Math.round(Math.max(0, Math.min(1, rawScore)) * 100)

  // Risk tier
  let riskLevel
  if (probability >= 65)      riskLevel = 'Low'
  else if (probability >= 40) riskLevel = 'Medium'
  else                        riskLevel = 'High'

  // Recommendations
  const recommendations = _buildRecommendations(input, probability)

  // Build feature_importance as a plain object keyed by label (Object.entries-friendly)
  const featureImportanceMap = {
    'Market Size':        Math.round(marketScore * 100),
    'Innovation':         Math.round(innovScore * 100),
    'Budget':             Math.round(budgetScore * 100),
    'Business Model':     Math.round(businessModelScore * 100),
    'Industry':           Math.round(industryScore * 100),
    'Team Size':          Math.round(teamScore * 100),
    'Founder Experience': Math.round(expScore * 100),
    'Has MVP':            mvpScore * 100,
    'Has Traction':       tractionScore * 100,
  }

  return {
    // Primary fields the frontend reads
    success_probability: probability,
    prediction:          probability >= 50 ? 'Likely to Succeed' : 'Needs Improvement',
    confidence:          Math.round(60 + (Math.abs(probability - 50) / 50) * 35), // 60-95%
    risk_level:          riskLevel,
    feature_importance:  featureImportanceMap,
    insights:            recommendations,

    // Keep legacy fields for backwards compat
    probability,
    recommendations,
    model_version: '1.0.0',
    scoring_breakdown: {
      industry:           Math.round(industryScore * 100),
      business_model:     Math.round(businessModelScore * 100),
      budget:             Math.round(budgetScore * 100),
      team_size:          Math.round(teamScore * 100),
      market_size_score:  Math.round(marketScore * 100),
      innovation_score:   Math.round(innovScore * 100),
      founder_experience: Math.round(expScore * 100),
      has_mvp:            mvpScore * 100,
      has_traction:       tractionScore * 100,
      competition_penalty: Math.round(competitionPenalty * 100),
    },
  }
}

function _buildRecommendations(input, probability) {
  const recs = []

  if (!input.has_mvp)
    recs.push('Build an MVP to validate your idea and attract early adopters.')
  if (!input.has_traction)
    recs.push('Focus on gaining initial traction — even 10 paying customers changes the narrative.')
  if (Number(input.founder_experience) < 3)
    recs.push('Consider finding a co-founder or advisor with domain experience.')
  if (['< ₹1L', '₹1L - ₹5L'].includes(input.budget))
    recs.push('Explore funding options: angel investors, grants, or accelerator programs.')
  if (Number(input.competition_level) >= 7)
    recs.push('High competition detected — sharpen your differentiation strategy.')
  if (Number(input.market_size_score) < 5)
    recs.push('Consider expanding your target market to increase growth potential.')
  if (probability < 40)
    recs.push('Consider pivoting your business model or targeting a less saturated niche.')
  if (probability >= 65)
    recs.push('Strong fundamentals — focus on execution speed and customer acquisition.')

  return recs.length ? recs : ['Keep iterating and validating your assumptions with real customers.']
}

export function getModelInfo() {
  return {
    model_name:    'StartupGPT Success Predictor',
    version:       '1.0.0',
    algorithm:     'Weighted Scoring Model',
    features:      Object.keys(WEIGHTS),
    industries:    Object.keys(INDUSTRY_SCORES),
    business_models: Object.keys(BUSINESS_MODEL_SCORES),
    budget_ranges: Object.keys(BUDGET_SCORES),
    team_sizes:    Object.keys(TEAM_SIZE_SCORES),
    description:   'A weighted multi-factor scoring model that evaluates startup success probability based on 10 key dimensions.',
  }
}
