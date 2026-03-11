const Joi = require('joi');
const { generateContent } = require('./_lib/openai');
const { verifyAllCitations } = require('./_lib/pubmed');

const briefSchema = Joi.object({
  drugClass: Joi.string().max(100).required(),
  molecule: Joi.string().max(100).required(),
  brandName: Joi.string().max(100).allow('').optional(),
  competitor: Joi.string().max(100).allow('').optional(),
  competitorBrand: Joi.string().max(100).allow('').optional(),
  contentBrief: Joi.string().min(20).max(2000).required(),
  generateBehavioural: Joi.boolean().default(true),
  generateClinical: Joi.boolean().default(true),
  generateSolutionFor: Joi.boolean().default(true),
  generateSolutionVs: Joi.boolean().default(false),
  usePublishedLiterature: Joi.boolean().default(true),
  useDataOnFile: Joi.boolean().default(false),
  region: Joi.string().max(50).optional(),
  yearFrom: Joi.number().integer().min(1990).max(2030).optional(),
  audience: Joi.string().max(50).optional(),
  tone: Joi.string().max(50).optional(),
  pairsRequested: Joi.number().integer().min(1).max(8).default(4)
});

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const startTime = Date.now();

  // Validate input
  const { error, value: brief } = briefSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      error: 'Invalid request',
      details: error.details.map(d => d.message)
    });
  }

  if (brief.generateSolutionVs && !brief.competitor) {
    return res.status(400).json({
      error: 'Competitor molecule is required when "vs Competitor" solution is selected.'
    });
  }

  try {
    const generated = await generateContent(brief);
    const verifiedPairs = await verifyAllCitations(generated.pairs);

    const allCitations = verifiedPairs.flatMap(p => [
      ...(p.need?.citations || []),
      ...(p.solution?.citations || [])
    ]);
    const verifiedCount = allCitations.filter(c => c.verified).length;
    const totalCount = allCitations.length;
    const indiaDataCount = allCitations.filter(c => c.india_data).length;

    return res.status(200).json({
      success: true,
      meta: {
        molecule: brief.molecule,
        competitor: brief.competitor || null,
        brand: brief.brandName || null,
        generated_at: new Date().toISOString(),
        duration_ms: Date.now() - startTime,
        pairs_generated: verifiedPairs.length,
        citations: {
          total: totalCount,
          verified: verifiedCount,
          unverified: totalCount - verifiedCount,
          india_data: indiaDataCount
        }
      },
      brief_summary: generated.brief_summary,
      pairs: verifiedPairs,
      data_gaps: generated.data_gaps || [],
      india_data_available: generated.india_data_available || false
    });

  } catch (err) {
    if (err.message?.includes('API key')) {
      return res.status(500).json({ error: 'AI service configuration error. Contact administrator.' });
    }

    return res.status(500).json({
      error: err.message || 'Generation failed. Please try again.',
      suggestion: 'If this persists, try simplifying your content brief.'
    });
  }
};
