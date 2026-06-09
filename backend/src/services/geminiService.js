/**
 * Gemini AI Service
 * All LLM interactions via @google/generative-ai SDK.
 */
import { GoogleGenerativeAI } from '@google/generative-ai'
import { config } from '../config/index.js'

function getModel() {
  const genAI = new GoogleGenerativeAI(config.gemini.apiKey)
  return genAI.getGenerativeModel({
    model: config.gemini.model,
    generationConfig: { responseMimeType: 'application/json' },
  })
}

/**
 * Language style instruction injected into every prompt.
 * Tells Gemini to use plain, simple English anyone can understand.
 */
const SIMPLE_LANGUAGE = `
IMPORTANT — Language Style:
- Use simple, everyday English. Write like you are explaining to a friend, not a professor.
- Avoid complex business jargon, technical buzzwords, and difficult vocabulary.
- Use short sentences. Be clear and direct.
- If you must use a technical term, explain it in simple words right after.
- Anyone with basic English should be able to read and understand your response easily.
`

/**
 * Strip markdown code fences and parse JSON from a Gemini response.
 * Handles cases where Gemini wraps JSON in prose or code fences.
 */
function extractJSON(text) {
  // 1. Try stripping ```json / ``` fences first
  let cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim()

  // 2. Try parsing directly
  try { return JSON.parse(cleaned) } catch {}

  // 3. Find the first { ... } or [ ... ] block in the text (handles prose wrapping)
  const firstBrace   = text.indexOf('{')
  const firstBracket = text.indexOf('[')
  let start = -1
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    start = firstBrace
  } else if (firstBracket !== -1) {
    start = firstBracket
  }

  if (start !== -1) {
    // Find matching closing delimiter
    const open  = text[start]
    const close = open === '{' ? '}' : ']'
    let depth = 0, end = -1
    for (let i = start; i < text.length; i++) {
      if (text[i] === open)  depth++
      if (text[i] === close) depth--
      if (depth === 0) { end = i; break }
    }
    if (end !== -1) {
      try { return JSON.parse(text.slice(start, end + 1)) } catch {}
    }
  }

  // 4. Nothing worked — throw a clean error
  throw new Error(`Gemini returned non-JSON response: ${text.slice(0, 120)}`)
}

// ─── Startup Idea Generation ─────────────────────────────────────────────────

export async function generateStartupIdeas({ interests, skills, budget, industry }) {
  const model = getModel()
  const prompt = `
You are a friendly startup advisor who helps first-time entrepreneurs.
${SIMPLE_LANGUAGE}
Generate 3 unique startup ideas based on this person's profile:
- Interests: ${interests}
- Skills: ${skills}
- Budget: ${budget} (INR)
- Industry: ${industry}

Return ONLY a valid JSON object with this exact structure:
{
  "ideas": [
    {
      "title": "Startup Name",
      "description": "2-3 simple sentences about what this startup does",
      "problem_solved": "What problem does this fix in simple words",
      "unique_value": "What makes it different from others",
      "revenue_model": "How this startup makes money (explain simply)",
      "target_audience": "Who will use this product",
      "estimated_market_size": "How big is this market",
      "tech_stack_suggestion": ["tech1", "tech2"],
      "difficulty_level": "Easy|Medium|Hard",
      "time_to_market": "How long to launch"
    }
  ],
  "market_insights": "A simple 1-2 sentence insight about this market",
  "recommended_first_steps": ["step1", "step2", "step3"]
}
`
  const result = await model.generateContent(prompt)
  return extractJSON(result.response.text())
}

// ─── SWOT Analysis ────────────────────────────────────────────────────────────

export async function generateSwotAnalysis({ startup_idea, industry, target_market, business_model }) {
  const model = getModel()
  const prompt = `
You are a friendly business advisor helping a first-time startup founder.
${SIMPLE_LANGUAGE}
Do a SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) for this startup:
- Startup Idea: ${startup_idea}
- Industry: ${industry}
- Target Market: ${target_market}
- Business Model: ${business_model}

Return ONLY a valid JSON object:
{
  "strengths": [
    { "point": "Short strength title", "description": "Simple explanation of why this is a strength" }
  ],
  "weaknesses": [
    { "point": "Short weakness title", "description": "Simple explanation of this weakness" }
  ],
  "opportunities": [
    { "point": "Short opportunity title", "description": "Simple explanation of this opportunity" }
  ],
  "threats": [
    { "point": "Short threat title", "description": "Simple explanation of this threat" }
  ],
  "strategic_recommendations": ["Simple action step 1", "Simple action step 2"],
  "overall_assessment": "A simple 2-3 sentence summary of the overall situation"
}

Include 3-4 items per category.
`
  const result = await model.generateContent(prompt)
  return extractJSON(result.response.text())
}

// ─── Investor Pitch ───────────────────────────────────────────────────────────

export async function generateInvestorPitch({ startup_name, problem, solution, target_market, business_model, funding_needed }) {
  const model = getModel()
  const prompt = `
You are a friendly pitch coach helping a first-time founder prepare for investors.
${SIMPLE_LANGUAGE}
Create an investor pitch for this startup:
- Startup: ${startup_name}
- Problem: ${problem}
- Solution: ${solution}
- Target Market: ${target_market}
- Business Model: ${business_model}
- Funding Needed: ${funding_needed}

Return ONLY a valid JSON object:
{
  "elevator_pitch": "A simple 2-3 sentence pitch you can say in 30 seconds",
  "problem_statement": "Explain the problem in simple words that anyone can understand",
  "solution_overview": "Explain your solution simply — what it does and how",
  "value_proposition": "In one sentence, why customers will choose you",
  "market_opportunity": {
    "tam": "Total market size (explain what TAM means simply)",
    "sam": "The part of the market you can realistically reach",
    "som": "The part you will target first"
  },
  "business_model_details": "How you make money — explained simply",
  "traction_milestones": ["milestone1", "milestone2", "milestone3"],
  "funding_breakdown": [
    { "category": "What you will spend on", "percentage": 30, "amount": "₹X", "description": "Why you need this money" }
  ],
  "team_requirements": ["role1", "role2"],
  "competitive_advantage": "Why you will win against competitors — in simple words",
  "call_to_action": "What you are asking from investors"
}
`
  const result = await model.generateContent(prompt)
  return extractJSON(result.response.text())
}

// ─── Competitor Analysis ──────────────────────────────────────────────────────

export async function generateCompetitorAnalysis({ startup_idea, industry, target_market, unique_features }) {
  const model = getModel()
  const prompt = `
You are a friendly market research helper for a first-time startup founder.
${SIMPLE_LANGUAGE}
Analyse the competition for this startup:
- Startup Idea: ${startup_idea}
- Industry: ${industry}
- Target Market: ${target_market}
- Unique Features: ${unique_features}

Return ONLY a valid JSON object:
{
  "direct_competitors": [
    {
      "name": "Competitor name",
      "description": "What they do in simple words",
      "strengths": ["what they are good at"],
      "weaknesses": ["where they fall short"],
      "market_share": "How much of the market they have",
      "threat_level": "High|Medium|Low"
    }
  ],
  "indirect_competitors": [
    {
      "name": "Competitor name",
      "description": "What they do",
      "overlap": "How they compete with you indirectly"
    }
  ],
  "market_gaps": ["gap1 — explain simply", "gap2", "gap3"],
  "differentiation_strategy": "How you can stand out — in simple words",
  "uniqueness_score": 75,
  "competitive_advantages": ["advantage1 in simple words", "advantage2"],
  "market_entry_strategy": "The best way to enter this market — explained simply"
}
`
  const result = await model.generateContent(prompt)
  return extractJSON(result.response.text())
}

// ─── Business Name Generator ──────────────────────────────────────────────────

export async function generateBusinessNames({ industry, description, target_audience, style }) {
  const model = getModel()
  const prompt = `
You are a friendly branding expert helping a first-time founder name their startup.
${SIMPLE_LANGUAGE}
Suggest startup names for:
- Industry: ${industry}
- Description: ${description}
- Target Audience: ${target_audience}
- Style Preference: ${style}

Return ONLY a valid JSON object:
{
  "names": [
    {
      "name": "StartupName",
      "tagline": "A short catchy line",
      "meaning": "What this name means and why it fits — in simple words",
      "domain_suggestions": ["startupname.com", "getstartupname.com"],
      "brand_personality": "Professional|Playful|Bold|Minimal|Tech",
      "memorability_score": 85
    }
  ],
  "naming_rationale": "Why these names were chosen — explained simply",
  "brand_guidelines": {
    "tone": "How the brand should sound when talking to customers",
    "colors": ["#color1", "#color2"],
    "typography_style": "What kind of font style fits this brand"
  }
}

Generate 5 name suggestions.
`
  const result = await model.generateContent(prompt)
  return extractJSON(result.response.text())
}

// ─── Startup Roadmap Generator ────────────────────────────────────────────────

export async function generateStartupRoadmap({ startup_idea, industry, budget, team_size, timeline }) {
  const model = getModel()
  const prompt = `
You are a friendly startup coach helping a first-time founder plan their journey step by step.
${SIMPLE_LANGUAGE}
Create a simple step-by-step roadmap for this startup:
- Startup Idea: ${startup_idea}
- Industry: ${industry}
- Budget: ${budget} (INR)
- Team Size: ${team_size}
- Target Timeline: ${timeline}

Return ONLY a valid JSON object with this exact structure:
{
  "phases": [
    {
      "phase": 1,
      "title": "Phase name",
      "duration": "e.g. Month 1-2",
      "goal": "What you want to achieve in this phase — in simple words",
      "tasks": [
        { "task": "Task name", "description": "What to do and how — explained simply", "priority": "High|Medium|Low" }
      ],
      "milestones": ["What you should have done by end of this phase"],
      "budget_allocation": "e.g. ₹50,000",
      "team_needed": ["role1", "role2"],
      "success_metrics": ["How you know this phase went well"]
    }
  ],
  "total_phases": 4,
  "key_risks": [
    { "risk": "What could go wrong", "mitigation": "How to avoid or fix it — in simple words" }
  ],
  "tech_stack": ["tech1", "tech2"],
  "estimated_revenue_timeline": "When you can expect to start making money",
  "critical_success_factors": ["What you must get right to succeed"],
  "summary": "A simple 2-3 sentence summary of the whole plan"
}

Generate 4 phases: Validate your idea → Build the product → Launch to customers → Grow and scale.
`
  const result = await model.generateContent(prompt)
  return extractJSON(result.response.text())
}

// ─── Market Trends ────────────────────────────────────────────────────────────

export async function generateMarketTrends({ industry, region, focus }) {
  const model = getModel()
  const prompt = `
You are a friendly market research helper explaining trends to a first-time startup founder.
${SIMPLE_LANGUAGE}
Explain the current market trends for:
- Industry: ${industry}
- Region: ${region}
- Focus Area: ${focus}

Return ONLY a valid JSON object with this exact structure:
{
  "industry_overview": "2-3 simple sentences about what is happening in this industry right now",
  "market_size": {
    "current": "How big the market is today",
    "projected": "How big it will be in 5 years",
    "cagr": "How fast it is growing each year (in %)"
  },
  "top_trends": [
    {
      "trend": "Trend name",
      "description": "What this trend means in simple words",
      "impact": "High|Medium|Low",
      "opportunity": "How a new startup can use this trend to their advantage"
    }
  ],
  "emerging_technologies": [
    { "tech": "Technology name", "adoption_stage": "Early|Growing|Mainstream", "relevance": "Why this technology matters for startups in this space — simply explained" }
  ],
  "hot_segments": [
    { "segment": "Segment name", "growth": "Growth %", "why_hot": "Why this area is growing fast — in simple words" }
  ],
  "investment_landscape": {
    "total_funding_2024": "Total money invested in this industry in 2024",
    "top_investors": ["investor1", "investor2"],
    "avg_seed_round": "Average first funding amount in INR",
    "hot_investment_areas": ["area1", "area2"]
  },
  "consumer_behavior_shifts": ["How customers are changing their habits — explained simply"],
  "regulatory_landscape": "Key rules and laws affecting this industry — explained in plain language",
  "challenges": [
    { "challenge": "Challenge name", "severity": "High|Medium|Low", "advice": "Simple advice on how to deal with this" }
  ],
  "opportunities": [
    { "opportunity": "Opportunity name", "potential": "High|Medium|Low", "action": "What a startup can do to grab this opportunity" }
  ],
  "success_stories": [
    { "company": "Company name", "what_they_did": "What they did in simple words", "outcome": "What happened as a result" }
  ],
  "predictions": ["Simple prediction about what will happen in this industry in the next 2-3 years"],
  "last_updated": "May 2025"
}
`
  const result = await model.generateContent(prompt)
  return extractJSON(result.response.text())
}
